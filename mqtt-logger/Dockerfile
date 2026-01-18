FROM python:3.12-alpine

RUN apk add --no-cache mosquitto-clients curl

RUN pip install paho-mqtt requests

COPY mqtt_pipe.py .
CMD ["python", "mqtt_pipe.py"]
