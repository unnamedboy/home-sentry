#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import time
import json
import threading
from collections import defaultdict

import requests
from requests.adapters import HTTPAdapter
import paho.mqtt.client as mqtt

# -----------------------------
# Env
# -----------------------------
MQTT_HOST = os.getenv("MQTT_HOST", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "homeassistant/#")

LOKI_URL = os.getenv("LOKI_URL", "http://loki:3100/loki/api/v1/push")

DEBOUNCE_MS = int(os.getenv("DEBOUNCE_MS", "300"))
FLUSH_INTERVAL_MS = int(os.getenv("FLUSH_INTERVAL_MS", "50"))

PRINT_LOKI_ERRORS = os.getenv("PRINT_LOKI_ERRORS", "1") == "1"
PRINT_LOKI_SUCCESS = os.getenv("PRINT_LOKI_SUCCESS", "0") == "1"

HTTP_TIMEOUT_SEC = float(os.getenv("HTTP_TIMEOUT_SEC", "3"))
HTTP_POOL_CONNECTIONS = int(os.getenv("HTTP_POOL_CONNECTIONS", "20"))
HTTP_POOL_MAXSIZE = int(os.getenv("HTTP_POOL_MAXSIZE", "50"))

# -----------------------------
# State
# -----------------------------
# entity_cache["domain/entity_id"][attr] = value
entity_cache = defaultdict(dict)

# debounce schedule: entity_path -> due_at(monotonic seconds)
next_flush_at = {}

# last MQTT receive timestamp: entity_path -> ns
last_event_ts_ns = {}

lock = threading.RLock()
stop_event = threading.Event()


# -----------------------------
# HTTP Session (connection pool)
# -----------------------------
def build_session() -> requests.Session:
    s = requests.Session()
    adapter = HTTPAdapter(
        pool_connections=HTTP_POOL_CONNECTIONS,
        pool_maxsize=HTTP_POOL_MAXSIZE,
        max_retries=0,
        pool_block=False,
    )
    s.mount("http://", adapter)
    s.mount("https://", adapter)
    return s


SESSION = build_session()


# -----------------------------
# Payload parsing
# -----------------------------
def parse_payload(payload_str: str):
    """
    - Leverage json.loads for auto-decoding
    - Fallback to raw string, avoiding manual unicode_escape
    """
    try:
        return json.loads(payload_str)
    except Exception:
        return payload_str


# -----------------------------
# Loki formatting
# -----------------------------
def build_labels(entity_path: str, attrs: dict) -> dict:
    domain, entity_id = entity_path.split("/", 1)
    labels = {
        "job": "ha_mqtt",
        "service_name": "ha_mqtt",
        "domain": domain,
        "entity_id": entity_id,
    }

    # device_class usually unmutable, can be considered as label
    dc = attrs.get("device_class")
    if isinstance(dc, str) and dc:
        labels["device_class"] = dc

    return labels


def build_line(entity_path: str, attrs: dict) -> str:
    """
    Store high-cardinality and volatile fields in the log line (JSON), not in labels.
    Specifically, fields like friendly_name should be placed here.
    """
    line_obj = {
        "entity": entity_path,
        "state": attrs.get("state"),
        "friendly_name": attrs.get("friendly_name"),
        "unit_of_measurement": attrs.get("unit_of_measurement"),
        "state_class": attrs.get("state_class"),
        "supported_features": attrs.get("supported_features"),
        "app_id": attrs.get("app_id"),
        "app_name": attrs.get("app_name"),
        "media_title": attrs.get("media_title"),
        "media_artist": attrs.get("media_artist"),
        "media_album_name": attrs.get("media_album_name"),
        "media_duration": attrs.get("media_duration"),
        "media_position": attrs.get("media_position"),
        "media_position_updated_at": attrs.get("media_position_updated_at"),
        "volume_level": attrs.get("volume_level"),
        "entity_picture": attrs.get("entity_picture"),
    }

    # remove none value to reduce noizes
    line_obj = {k: v for k, v in line_obj.items() if v is not None}

    return json.dumps(line_obj, ensure_ascii=False, separators=(",", ":"))


def push_loki(payload: dict, kind: str):
    try:
        r = SESSION.post(LOKI_URL, json=payload, timeout=HTTP_TIMEOUT_SEC)
        if r.status_code >= 300:
            if PRINT_LOKI_ERRORS:
                print(f"[LOKI] {kind} push failed {r.status_code}: {r.text[:300]}")
        else:
            if PRINT_LOKI_SUCCESS:
                print(f"[LOKI] {kind} ok")
    except Exception as e:
        if PRINT_LOKI_ERRORS:
            print(f"[LOKI] {kind} error: {e}")


def send_entity_to_loki(entity_path: str, attrs: dict, timestamp_ns: int):
    # if no 'state', this message can be discarded, as the log analysis is based on this field
    if "state" not in attrs:
        return

    labels = build_labels(entity_path, attrs)
    line = build_line(entity_path, attrs)

    payload = {
        "streams": [{
            "stream": labels,
            "values": [[str(timestamp_ns), line]]
        }]
    }
    push_loki(payload, kind="entity")


# -----------------------------
# Debounce flush worker (single thread, no Timer storm)
# -----------------------------
def flush_worker():
    interval = max(1, FLUSH_INTERVAL_MS) / 1000.0
    while not stop_event.is_set():
        now = time.monotonic()
        due = []

        with lock:
            for entity_path, due_at in list(next_flush_at.items()):
                if now >= due_at:
                    due.append(entity_path)
            for entity_path in due:
                next_flush_at.pop(entity_path, None)

        # flush outside lock
        for entity_path in due:
            with lock:
                attrs = dict(entity_cache.get(entity_path, {}))
                ts_ns = last_event_ts_ns.get(entity_path, time.time_ns())
            send_entity_to_loki(entity_path, attrs, ts_ns)

        time.sleep(interval)


def schedule_flush(entity_path: str):
    due_at = time.monotonic() + (DEBOUNCE_MS / 1000.0)
    with lock:
        next_flush_at[entity_path] = due_at


# -----------------------------
# MQTT callbacks
# -----------------------------
def on_connect(client, userdata, flags, rc):
    print(f"[MQTT] connected rc={rc}, subscribing: {MQTT_TOPIC}")
    client.subscribe(MQTT_TOPIC)


def on_message(client, userdata, msg):
    ts_ns = time.time_ns()
    topic = msg.topic
    payload_str = msg.payload.decode(errors="replace")

    parts = topic.split("/")
    if len(parts) >= 4 and parts[0] == "homeassistant":
        domain = parts[1]
        entity_id = parts[2]
        attribute = "/".join(parts[3:])  # multiple layer attributes

        entity_path = f"{domain}/{entity_id}"
        value = parse_payload(payload_str)

        with lock:
            entity_cache[entity_path][attribute] = value
            last_event_ts_ns[entity_path] = ts_ns

        # Debounce any fields, if the state field not exists, discard the message
        schedule_flush(entity_path)
        return

    # fallback raw
    raw_payload = {
        "streams": [{
            "stream": {"job": "ha_mqtt_raw", "service_name": "ha_mqtt"},
            "values": [[str(ts_ns), f"{topic} {payload_str}"]]
        }]
    }
    push_loki(raw_payload, kind="raw")


# -----------------------------
# Main
# -----------------------------
def main():
    t = threading.Thread(target=flush_worker, daemon=True)
    t.start()

    client = mqtt.Client(protocol=mqtt.MQTTv311)
    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)

    try:
        client.loop_forever()
    finally:
        stop_event.set()
        try:
            SESSION.close()
        except Exception:
            pass


if __name__ == "__main__":
    main()
