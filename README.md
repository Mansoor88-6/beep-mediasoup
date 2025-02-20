# WM Deployment

This repository contains the Docker Compose setup for deploying the **IM-FRONTEND** and **IM-BACKEND** services in a containerized environment.

## Prerequisites

Ensure you have the following installed before proceeding:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Project Structure

```
wm-deployment/
├── docker-compose.yml  # Docker Compose configuration
├── IM-FRONTEND/        # Frontend service
├── IM-BACKEND/         # Backend service
└── README.md           # Project documentation
```

## Services Overview

- **IM-FRONTEND**: React frontend application with typescript
- **IM-BACKEND**: Node.js backend with typescript

## Deployment Instructions

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-repo/wm-deployment.git
   cd wm-deployment
   ```

2. **Ensure environment variables are set**
   Create `.env.production` files for the backend and frontend (if applicable). Example for the backend:
   ```env
   MONGO_URI=MONGO_URL
   JWT_SECRET=your_secret_key
   PORT=6600
   ```

3. **Start the services**
   ```sh
   docker-compose up -d --build
   ```

4. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:6600](http://localhost:6600)
   - MongoDB: MONGO_URL

5. **Stopping the containers**
   ```sh
   docker-compose down
   ```

## Logs & Debugging
- View running containers:
  ```sh
  docker ps
  ```
- Check logs for a specific service:
  ```sh
  docker-compose logs -f IM-FRONTEND
  ```
- Restart a service:
  ```sh
  docker-compose restart IM-BACKEND
  ```

## Extending the Deployment
- Modify `docker-compose.yml` to add volumes, networks, or additional services.

## Troubleshooting
- Ensure ports 3000 and 6600 are not in use.
- Run `docker system prune -a` to free up space if needed.
- Check MongoDB connection inside the backend container:
  ```sh
  docker exec -it IM-BACKEND sh
  ```

## License
This project is licensed under [MIT-LICENCE](MIT-LICENCE).

