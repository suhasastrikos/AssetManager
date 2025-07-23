# Asset Manager

A comprehensive IoT Asset and Device Management System built with React and Node.js.

## Project Structure

```
asset-manager/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── vite.config.ts # Vite configuration
├── backend/          # Node.js backend server
│   ├── config/       # Database configuration
│   ├── routes/       # API routes
│   ├── package.json  # Backend dependencies
│   └── server.js     # Main server file
└── README.md         # This file
```

## Features

- **Asset Management**: Create and manage asset profiles and instances
- **Device Management**: Handle device profiles and device instances
- **Database Support**: PostgreSQL, MySQL, and MongoDB
- **Import/Export**: Support for JSON, CSV, and XML formats
- **Telemetry**: Real-time and historical data management
- **Attributes**: Key-value attribute management
- **Responsive UI**: Modern React interface with Tailwind CSS

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Database (PostgreSQL, MySQL, or MongoDB)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd asset-manager
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4. **Start the Backend Server**
```bash
npm run dev
```

5. **Start the Frontend Development Server**
```bash
cd ../frontend
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Configuration

### Frontend Configuration
- Copy `frontend/.env.example` to `frontend/.env`
- Update API URL if needed (default: http://localhost:3001/api)

### Backend Configuration
- Copy `backend/.env.example` to `backend/.env`
- Configure database settings (optional - can be done via UI)

## Database Setup

The application supports three database types:

### PostgreSQL (Recommended)
```bash
# Install PostgreSQL and create database
createdb asset_manager
```

### MySQL
```bash
# Create database
mysql -u root -p
CREATE DATABASE asset_manager;
```

### MongoDB
```bash
# Start MongoDB service
mongod
```

## Usage

1. **Database Connection**: Use the UI to connect to your database
2. **Create Profiles**: Start by creating asset and device profiles
3. **Add Assets**: Create assets based on your profiles
4. **Add Devices**: Create devices and link them to assets
5. **Import Data**: Use the import feature for bulk data uploads

## API Endpoints

### Database Management
- `POST /api/database/test-connection` - Test database connection
- `POST /api/database/connect` - Connect to database
- `GET /api/database/status` - Get connection status

### Entity Management
- Asset Profiles: `/api/asset-profiles`
- Device Profiles: `/api/device-profiles`
- Assets: `/api/assets`
- Devices: `/api/devices`
- Attributes: `/api/attributes`
- Telemetry: `/api/telemetry`

## Development

### Frontend Development
```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev    # Start with nodemon (auto-restart)
npm start      # Start production server
```

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- PostgreSQL/MySQL/MongoDB drivers
- CORS
- dotenv

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.