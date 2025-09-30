#!/bin/bash

case "$1" in
  "dev")
    echo "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    ;;
  "prod")
    echo "Starting production environment..."
    docker-compose up --build -d
    ;;
  "stop")
    echo "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    ;;
  "clean")
    echo "Cleaning up containers and images..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    ;;
  *)
    echo "Usage: $0 {dev|prod|stop|clean}"
    echo "  dev   - Start development environment"
    echo "  prod  - Start production environment"
    echo "  stop  - Stop all containers"
    echo "  clean - Clean up containers and images"
    exit 1
    ;;
esac