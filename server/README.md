# Asset Manager Backend Server

This is the backend server for the Asset Manager application that handles database connections and API endpoints.

## Features

- Database connection management (MySQL, PostgreSQL, MongoDB)
- RESTful API endpoints for all entities
- Connection testing and validation
- Error handling and logging
- CORS support for frontend integration

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env
```

4. Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on port 3001 by default.

## API Endpoints

### Database Management
- `POST /api/database/test-connection` - Test database connection
- `POST /api/database/connect` - Connect to database
- `POST /api/database/disconnect` - Disconnect from database
- `GET /api/database/status` - Get connection status

### Asset Profiles
- `GET /api/asset-profiles` - Get all asset profiles
- `GET /api/asset-profiles/:id` - Get asset profile by ID
- `POST /api/asset-profiles` - Create asset profile
- `PUT /api/asset-profiles/:id` - Update asset profile
- `DELETE /api/asset-profiles/:id` - Delete asset profile

### Device Profiles
- `GET /api/device-profiles` - Get all device profiles
- `GET /api/device-profiles/:id` - Get device profile by ID
- `POST /api/device-profiles` - Create device profile
- `PUT /api/device-profiles/:id` - Update device profile
- `DELETE /api/device-profiles/:id` - Delete device profile

### Assets
- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Attributes
- `GET /api/attributes` - Get attributes by entity
- `POST /api/attributes/:entityType/:entityId/:scope` - Save attributes
- `DELETE /api/attributes/:entityType/:entityId/:scope/:key` - Delete attribute

### Telemetry
- `GET /api/telemetry/:entityType/:entityId/values/timeseries` - Get telemetry data
- `POST /api/telemetry/:entityType/:entityId` - Save telemetry data
- `DELETE /api/telemetry/:entityType/:entityId/timeseries/delete` - Delete telemetry data

## Database Support

The server supports the following databases:
- **PostgreSQL** (recommended)
- **MySQL**
- **MongoDB**

Database connections are managed through the UI and don't require manual configuration.

## Development

The server uses in-memory storage for demonstration purposes. In a production environment, you would integrate with actual database operations using the connected database instance.

## Error Handling

All endpoints include proper error handling with meaningful error messages and appropriate HTTP status codes.