# PFM Dockerized Community Management Application

A containerized community management system that enables members to create and participate in multiple-choice voting, built on the Solana blockchain. This project is configured for a seamless, fully containerized development experience using VS Code Dev Containers.

This repository contains the source code, documentation, and configuration for the application.

---

## Architecture

The project is currently focused on the Solana smart contract, which serves as the on-chain backend. The development environment is entirely managed by Docker and VS Code Dev Containers, providing a consistent and reproducible setup with all necessary tools pre-installed.

Future services, such as a web frontend and backend API, will be added and integrated into this containerized workflow.

### Current Components

1.  **Solana Smart Contract (`contracts/voting`)**
    *   **Responsibility:** Handles all on-chain logic for community management and voting.
    *   **Technology:** Rust, Anchor Framework.
    *   **Development:** All development and testing occurs within the provided dev container.

2.  **Containerized Services**
    *   **Backend API:** Express.js server handling authentication and data management
    *   **Admin Portal:** Next.js application for community administration
    *   **Member Portal:** Next.js application for community members
    *   **Supporting Services:** PostgreSQL, Redis, and Solana local validator

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (for local development)

### Setup Steps
1.  **Clone the repository:**
    ```sh
    git clone https://github.com/danribes/pfm_solana_rust
    cd pfm_solana_rust
    ```
2.  **Start the containerized services:**
    ```sh
    docker-compose up -d
    ```
3.  **Access the applications:**
    -   **Backend API:** http://localhost:3000
    -   **Admin Portal:** http://localhost:3001
    -   **Member Portal:** http://localhost:3002

---

## Development Workflow

The application uses a microservices architecture with separate containers for each service. All services can be managed using Docker Compose.

### Working with the Smart Contract

All contract-related commands should be run from the `contracts/voting` directory.

1.  **Navigate to the contract directory:**
    ```sh
    cd contracts/voting
    ```

2.  **Build the contract:**
    -   This command compiles the Rust code and generates the IDL (Interface Definition Language) and other artifacts.
    ```sh
    anchor build
    ```

3.  **Run tests:**
    -   This command starts a local Solana validator, deploys the contract, and runs the TypeScript tests located in `contracts/voting/tests/`.
    ```sh
    anchor test
    ```

### Docker Compose
The `docker-compose.yml` file orchestrates all application services:
-   `backend`: Express.js API server
-   `admin-portal`: Next.js admin interface  
-   `member-portal`: Next.js member interface
-   `postgres`: PostgreSQL database
-   `redis`: Redis cache and session store
-   `solana-local-validator`: Solana blockchain node

You can start the services manually if needed:
```sh
docker-compose up -d
```

To stop the services:
```sh
docker-compose down
```

---

## Documentation

### Deployment & Operations
- **[Deployment Guide](docs/deployment-guide.md)** - Comprehensive deployment procedures for all environments
- **[Operations Runbook](docs/operations-runbook.md)** - Daily operations, incident response, and maintenance procedures  
- **[Access & Permissions](docs/access-permissions.md)** - User roles, security policies, and access management
- **[Monitoring & Logging](docs/monitoring-logging-guide.md)** - Observability, metrics, and log analysis procedures

### Technical Documentation
- **[Database Integration](docs/database-smart-contract-integration.md)** - Database and smart contract integration details
- **[Middleware Architecture](docs/middleware-and-redis-architecture.md)** - Redis caching and middleware implementation

### Quick Reference
- **Health Checks:** `/health` endpoint available on all services
- **Metrics:** Prometheus metrics at `/metrics` on backend service
- **Monitoring:** Grafana dashboard at http://localhost:3003 (admin/admin)
- **Logs:** Centralized logging with Loki at http://localhost:3100
