# Docker Setup

## Quick Start

### Development Environment
```bash
./docker.sh dev
```

### Production Environment
```bash
./docker.sh prod
```

### Stop All Containers
```bash
./docker.sh stop
```

### Clean Up
```bash
./docker.sh clean
```

## Manual Commands

### Development
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production
```bash
docker-compose up --build
```

## Services

- **App**: Next.js application running on port 3000
- **MongoDB**: Database running on port 27017

## Environment Variables

- Development uses local MongoDB container
- Production can use external MongoDB (set MONGODB_URI in .env)

## Database Access

Default MongoDB credentials:
- Username: admin
- Password: password
- Database: university