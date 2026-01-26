# Home Sentry - Integrated Smart Home Monitoring Platform

A comprehensive, self-hosted smart home monitoring and management platform combining Home Assistant, MQTT, Loki logging, and a custom NestJS backend API.

## Project Overview

Home Sentry is a complete smart home solution designed for privacy-conscious users who want full control over their home automation infrastructure. It integrates:

- **Home Assistant** - Home automation platform
- **MQTT** - Message broker for device communication
- **Loki** - Log aggregation and analysis
- **Grafana** - Visualization and monitoring dashboards
- **Custom NestJS Backend** - REST API for smart home management

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Home Sentry Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Home Assistant  │◄───────►│   MQTT Broker    │          │
│  │  (Automations)   │         │  (Mosquitto)     │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                           │                      │
│           └────────────┬──────────────┘                      │
│                        │ (MQTT Statestream)                  │
│                        ▼                                     │
│         ┌──────────────────────────┐                        │
│         │   Loki Log Aggregator    │                        │
│         │   (Log persistence)      │                        │
│         └──────────────────────────┘                        │
│           │                                                  │
│           ├─────────────────┬────────────────────┐          │
│           ▼                 ▼                    ▼           │
│      ┌─────────┐    ┌───────────┐    ┌──────────────┐      │
│      │ Grafana │    │  NestJS   │    │ Query Script │      │
│      │  (UI)   │    │  Backend  │    │  (Analytics) │      │
│      └─────────┘    └───────────┘    └──────────────┘      │
│                          │                                   │
│                          ▼                                   │
│                    ┌──────────────┐                         │
│                    │   Database   │                         │
│                    │   (SQLite)   │                         │
│                    └──────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
home-sentry/
├── backend/                    # NestJS REST API backend
│   └── home-sentry/
│       ├── src/
│       │   ├── authentication/ # JWT auth & security
│       │   ├── health/         # Health checks
│       │   ├── home/           # Core business logic
│       │   │   ├── entities/   # Database models
│       │   │   ├── controllers/# REST endpoints
│       │   │   └── services/   # Business logic
│       │   └── utils/
│       ├── test/               # E2E tests
│       └── README.md           # Backend documentation
│
├── home-assistant/             # Home automation configuration
│   ├── configuration.yaml      # HA core config
│   ├── automations.yaml        # Automation rules
│   ├── scripts.yaml            # Custom scripts
│   ├── scenes.yaml             # Scene definitions
│   ├── mqtt.yaml              # MQTT statestream config
│   ├── blueprints/            # Automation blueprints
│   ├── custom_components/     # Custom integrations
│   └── docker-compose.yaml
│
├── mosquitto/                  # MQTT Message Broker
│   ├── config/
│   │   └── mosquitto.conf     # Broker configuration
│   └── docker-compose.yaml
│
├── loki/                       # Log Aggregation
│   └── docker-compose.yaml
│
├── grafana/                    # Monitoring & Visualization
│   └── docker-compose.yaml
│
├── nginx/                      # Reverse Proxy
│   ├── nginx.conf
│   └── docker-compose.yaml
│
├── mqtt-logger/                # MQTT to Loki logger
│   ├── Dockerfile
│   ├── mqtt_pipe.py           # Python logger script
│   └── docker-compose.yaml
│
├── python-matter-server/       # Matter protocol support
│   └── docker-compose.yaml
│
├── query-ha.ps1               # PowerShell utility for querying logs
└── README.md                  # This file
```

## Features

### 🏠 Home Management
- Multi-home support with timezone configuration
- Room organization for device grouping
- Device management with customizable metadata

### 📊 Monitoring & Logging
- Complete audit trail of all changes
- MQTT-based device state logging
- Loki-based log aggregation and search
- Grafana dashboards for visualization

### 🔐 Security
- JWT-based authentication
- Secure API endpoints
- Private, self-hosted infrastructure

### 🤖 Automation
- Home Assistant automation rules
- MQTT message routing
- Customizable scripts and scenes

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for backend development)
- PowerShell (for query-ha.ps1 utility)

### Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd home-sentry
```

2. **Start Docker services**
```bash
# Start all services
docker-compose up -d

# Or start individual services
cd home-assistant && docker-compose up -d
cd ../mosquitto && docker-compose up -d
cd ../loki && docker-compose up -d
cd ../grafana && docker-compose up -d
cd ../nginx && docker-compose up -d
cd ../mqtt-logger && docker-compose up -d
```

3. **Setup Backend API**
```bash
cd backend/home-sentry
npm install
npm run start:dev
```

The API will be available at `http://localhost:3000`

4. **Access Services**
- Home Assistant: `http://localhost:8123`
- Grafana: `http://localhost:3000` (after setup)
- MQTT Broker: `localhost:1883`
- Loki: `http://localhost:3100`
- API: `http://localhost:3000`

## Component Details

### Home Assistant
Handles home automation rules, device integrations, and automation triggers.

**Key files:**
- `automations.yaml` - Define automation rules
- `scripts.yaml` - Custom script definitions
- `mqtt.yaml` - MQTT statestream configuration
- `scenes.yaml` - Scene definitions

See [Home Assistant documentation](https://www.home-assistant.io/) for detailed configuration.

### MQTT Broker (Mosquitto)
Lightweight message broker for device communication.

**Configuration:** mosquitto.conf

### Loki
Log aggregation service for storing and querying logs from MQTT devices.

**API:** `http://localhost:3100/loki/api/v1/query_range`

### Grafana
Visualization dashboard for monitoring logs and metrics.

**Default credentials:** (Configure on first access)

### Backend API (NestJS)
REST API for managing smart home data and audit logs.

See README.md for detailed documentation.

### Query Utility (query-ha.ps1)
PowerShell script for querying logs from Loki via command line.

**Usage:**
```powershell
# Query all logs
.\query-ha.ps1

# Query by device class
.\query-ha.ps1 -device sensor

# Query by friendly name (fuzzy match)
.\query-ha.ps1 -Name "卧室"

# Query with time range (seconds ago)
.\query-ha.ps1 -Start 3600 -End 1800

# Limit results
.\query-ha.ps1 -Limit 500 -Last 50
```

**Parameters:**
- `-DeviceClass` / `-device`: Filter by device class (e.g., sensor, light, switch)
- `-FriendlyName` / `-Name`: Fuzzy match device name (case-insensitive)
- `-Start`: Start time in seconds from now (negative = past)
- `-End`: End time in seconds from now
- `-Limit`: Maximum log entries to fetch (default: 1000)
- `-Last`: Number of recent results to display (default: 100)

## Development

### Backend Development

```bash
cd backend/home-sentry

# Development with hot-reload
npm run start:dev

# Run tests
npm run test

# Check code quality
npm run lint
npm run format
```

See README.md for detailed backend documentation.

### Home Assistant Configuration

Edit YAML files in home-assistant directory and restart Home Assistant through the UI.

### MQTT Configuration

Modify mosquitto.conf and restart the container:
```bash
cd mosquitto
docker-compose restart
```

## Configuration

### Environment Variables

Create a `.env` file in home-sentry:

```bash
# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_me_securely
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=3600

# Loki
LOKI_HOST=192.168.1.100
LOKI_PORT=3100

# Database
DATABASE_URL=sqlite:./home-sentry.db
```

### Network Configuration

Default ports:
- **Home Assistant**: 8123
- **Grafana**: 3000
- **MQTT Broker**: 1883
- **Loki**: 3100
- **NestJS Backend**: 3000
- **Nginx**: 80, 443

## Monitoring & Logs

### Query MQTT Logs with Loki

Using PowerShell:
```powershell
# Get last 100 sensor logs
.\query-ha.ps1 -device sensor -Last 100

# Search for bedroom device changes in last hour
.\query-ha.ps1 -Name "bedroom" -Start 3600
```

### Grafana Dashboards

Create dashboards in Grafana to visualize data from Loki.

## Database Schema

The backend uses SQLite with the following main tables:

- **homes** - Smart home instances
- **rooms** - Rooms in homes
- **devices** - Smart devices
- **signals** - Device state signals
- **audit_logs** - Change audit trail

See README.md for full schema details.

## Troubleshooting

### Services won't start
- Check Docker daemon is running
- Verify all required ports are available
- Check docker-compose logs: `docker-compose logs -f`

### MQTT connection issues
- Verify Mosquitto container is running: `docker-compose ps`
- Check network connectivity between containers
- Review mosquitto logs: `docker-compose logs mosquitto`

### Loki query not working
- Verify Loki is running and healthy
- Check query format in PowerShell script
- Review Loki logs for errors

### Backend API errors
- Check backend logs: `npm run start:dev`
- Verify database is initialized
- Check JWT configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
