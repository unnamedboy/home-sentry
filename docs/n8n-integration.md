# n8n Integration (Explore)

Branch: `feature/n8n-integration`

## Where n8n Could Fit

- **Grafana alerts** → Webhook → n8n → custom logic (filter, enrich) → HA / Slack / email
- **Loki logs** → n8n (schedule) → query Loki API → transform → notifications or AI pipeline
- **NestJS API** → n8n workflows for device/room automation triggers
- **MQTT** → n8n MQTT node (if run on same network as broker) for event-driven workflows

## Options to Explore

1. Run n8n in Docker alongside other services (same `home-sentry` network)
2. Webhook + HTTP Request nodes to talk to Loki, Grafana, HA, NestJS
3. Replace or complement Grafana → HA Webhook with n8n in the middle (e.g. conditional routing)

## Next Steps

- [ ] Add n8n to docker-compose (or separate compose)
- [ ] Document webhook/API endpoints for Loki, HA, NestJS
- [ ] Example workflow: window alert → n8n → HA
