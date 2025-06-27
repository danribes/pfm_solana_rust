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

2.  **Development Environment (`.devcontainer/`)**
    *   **Responsibility:** Defines the Docker-based development environment.
    *   **Core Functions:** Installs and configures Rust, Solana, Anchor, Node.js, and other required tooling.
    *   **Technology:** Docker, VS Code Dev Containers.

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Setup Steps
1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd pfm-docker
    ```
2.  **Open in VS Code:**
    ```sh
    code .
    ```
3.  **Reopen in Container:**
    -   After opening the folder, VS Code will detect the `.devcontainer` configuration and show a notification in the bottom-right corner.
    -   Click **"Reopen in Container"**.
    -   VS Code will build the Docker image and launch the development environment. This may take a few minutes on the first run.

---

## Development Workflow

Once the dev container is running, you have a terminal with all the necessary tools installed and configured.

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
The `docker-compose.yml` file is used to orchestrate the development environment. It defines two main services:
-   `dev`: The main development container where you will work.
-   `solana-local-validator`: A standalone Solana test validator instance, managed automatically by `anchor test`.

You can start the services manually if needed:
```sh
docker-compose up -d
```

To stop the services:
```sh
docker-compose down
```
