# n8n Integration (Explore)

Branch: `feature/n8n-integration`

## Architecture: Data → n8n Nodes

How each Home Sentry data source maps into n8n **trigger** and **input** nodes (n8n-style flow).

### Data sources → n8n node types

| Data source      | How it reaches n8n                    | n8n node(s)              |
|------------------|---------------------------------------|--------------------------|
| Grafana alerts   | Alert contact point POSTs to n8n     | **Webhook**              |
| Loki logs        | n8n calls Loki HTTP API (on schedule) | **Schedule** + **HTTP Request** |
| MQTT messages    | n8n subscribes to broker (same network) | **MQTT Trigger**       |
| Home Assistant   | n8n calls HA REST or HA sends webhook | **HTTP Request** / **Webhook** |
| NestJS backend   | n8n calls API or backend sends webhook | **HTTP Request** / **Webhook** |

---

### Workflow 1: Grafana alert → n8n → HA (node flow)

n8n-style: trigger → logic → action nodes.

```mermaid
flowchart LR
    subgraph Trigger
        A[Webhook]
    end
    subgraph Logic
        B[IF]
        C[Edit Fields]
    end
    subgraph Action
        D[HTTP Request<br/>Home Assistant]
    end

    A --> B
    B --> C
    C --> D
```

- **Webhook**: receives POST from Grafana contact point (alert JSON).
- **IF**: filter by `labels.friendly_name`, `state`, etc.
- **Edit Fields**: shape payload for HA (e.g. `notify.notify`).
- **HTTP Request**: call HA REST API or webhook.

---

### Workflow 2: Scheduled Loki query → n8n (node flow)

```mermaid
flowchart LR
    subgraph Trigger
        A[Schedule Trigger]
    end
    subgraph Fetch
        B[HTTP Request<br/>Loki query_range]
    end
    subgraph Logic
        C[Code / Set]
    end
    subgraph Action
        D[Slack / Email / AI]
    end

    A --> B
    B --> C
    C --> D
```

- **Schedule Trigger**: e.g. every 1h.
- **HTTP Request**: `GET http://loki:3100/loki/api/v1/query_range?query=...`
- **Code / Set**: parse response, aggregate, filter.
- **Slack / Email / AI**: send notification or forward to AI pipeline.

---

### Workflow 3: MQTT event → n8n (node flow)

```mermaid
flowchart LR
    subgraph Trigger
        A[MQTT Trigger]
    end
    subgraph Logic
        B[IF / Switch]
        C[Edit Fields]
    end
    subgraph Action
        D[HTTP Request<br/>HA / NestJS]
    end

    A --> B
    B --> C
    C --> D
```

- **MQTT Trigger**: subscribe to `homeassistant/#` or specific topics (n8n must be on same network as broker).
- **IF / Switch**: route by topic or payload (e.g. domain, entity_id).
- **Edit Fields**: map MQTT payload to HA/NestJS format.
- **HTTP Request**: call HA service or NestJS API.

---

### End-to-end: Grafana alert → n8n → HA (sequence)

```mermaid
sequenceDiagram
    participant G as Grafana
    participant W as n8n Webhook
    participant L as n8n Logic
    participant HA as Home Assistant

    G->>W: POST /webhook/grafana-alert (JSON)
    W->>L: Parse labels/annotations, filter by friendly_name
    L->>HA: POST /api/webhook/xxx or call_service
    HA->>HA: Send iOS push
```

## Where n8n fits

- **Grafana alerts** → Webhook → n8n → custom logic (filter, enrich) → HA / Slack / email
- **Loki logs** → n8n (schedule) → query Loki API → transform → notifications or AI pipeline
- **NestJS API** → n8n workflows for device/room automation triggers
- **MQTT** → n8n MQTT node (same network as broker) for event-driven workflows

## Options to explore

1. Run n8n in Docker alongside other services (same `home-sentry` network).
2. Use Webhook + HTTP Request nodes to talk to Loki, Grafana, HA, NestJS.
3. Put n8n between Grafana and HA (e.g. conditional routing) instead of or in addition to direct webhook.

## Next steps

- [ ] Add n8n to docker-compose (or separate compose)
- [ ] Document webhook/API endpoints for Loki, HA, NestJS
- [ ] Example workflow: window alert → n8n → HA
