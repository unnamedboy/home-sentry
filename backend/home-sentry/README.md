# Home Sentry - Smart Home Monitoring Backend

A modern, production-ready NestJS backend for smart home device management and monitoring.

## Overview

Home Sentry is a comprehensive backend solution for managing smart homes. It provides REST APIs for managing homes, rooms, devices, and tracks all changes through an audit logging system.

## Features

- **Home Management** - Create and manage multiple homes with timezone support
- **Room Organization** - Organize devices into rooms within homes
- **Device Control** - Manage smart devices with customizable source references
- **Audit Logging** - Complete audit trail of all create, update, and delete operations
- **JWT Authentication** - Secure API endpoints with JWT-based authentication
- **Health Monitoring** - Built-in health check endpoints
- **Type-Safe** - Full TypeScript support with strict type checking

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com) - Progressive Node.js framework
- **Database**: SQLite (prototype phase) with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest with comprehensive unit and e2e tests
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
$ npm install
```

## Development

### Running the Application

```bash
# Development mode with auto-reload
$ npm run start:dev

# Watch mode
$ npm run start:dev

# Debug mode
$ npm run start:debug

# Production build
$ npm run build
$ npm run start:prod
```

The API will be available at `http://localhost:3000`

## Testing

```bash
# Run all unit tests
$ npm run test

# Run tests in watch mode
$ npm run test:watch

# Run tests with coverage report
$ npm run test:cov

# Run e2e tests
$ npm run test:e2e
```

## Project Structure

```
src/
├── authentication/      # JWT authentication & authorization
├── health/             # Health check endpoints
├── home/               # Home, Room, and Device management
│   ├── entities/       # TypeORM entity definitions
│   └── *.service.ts    # Business logic with audit logging
└── utils/              # Utility functions
test/                   # End-to-end tests
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login with credentials

### Health
- `GET /health` - Health check endpoint

### Homes
- `GET /homes` - List all homes
- `POST /homes` - Create a new home
- `GET /homes/:id` - Get home details
- `PATCH /homes/:id` - Update home
- `DELETE /homes/:id` - Delete home

### Rooms
- `GET /homes/:homeId/rooms` - List rooms in a home
- `POST /homes/:homeId/rooms` - Create a room
- `GET /rooms/:id` - Get room details
- `PATCH /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

### Devices
- `GET /rooms/:roomId/devices` - List devices in a room
- `POST /devices` - Create a device
- `GET /devices/:id` - Get device details
- `PATCH /devices/:id` - Update device
- `DELETE /devices/:id` - Delete device

## Database Schema

The application uses TypeORM with SQLite for the prototype phase:

- **homes** - Smart home instances with timezone support
- **rooms** - Rooms within homes
- **devices** - Smart devices (lights, sensors, etc.)
- **signals** - Device state signals
- **audit_logs** - Complete audit trail of all changes

## Audit Logging

All create, update, and delete operations are automatically logged:

```json
{
  "tableName": "devices",
  "action": "UPDATE",
  "recordId": 1,
  "oldValue": { "name": "Light", "kind": "light" },
  "newValue": { "name": "Living Room Light", "kind": "light" },
  "timestamp": "2026-01-26T10:30:00Z"
}
```

## Configuration

Set the following environment variables in `.env`:

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password123
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600
```

## Code Quality

```bash
# Format code with Prettier
$ npm run format

# Lint and fix code
$ npm run lint
```

## Testing Coverage

The project maintains comprehensive test coverage including:

- ✅ 98+ unit tests
- ✅ Controller tests with mocked services
- ✅ Service tests with repository mocking
- ✅ Audit logging verification
- ✅ Error handling and edge cases

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm run test`)
2. Code is formatted (`npm run format`)
3. No linting errors (`npm run lint`)
4. New features include tests with ≥80% coverage

## License

UNLICENSED - This is a private project.

## Support

For issues and feature requests, please contact the development team.

---

**Version**: 0.0.1 (Prototype Phase)
