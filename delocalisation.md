# Project Delocalisation: Moving to a Dev Container Environment

This document tracks the process of converting the `pfm-docker` project from a hybrid local/Docker setup to a fully containerized development environment using VS Code Dev Containers.

## Goal

The primary goal is to remove all reliance on locally installed tools (Rust, Solana, Anchor, Node.js, etc.) by defining a consistent, reproducible development environment in Docker. This will simplify onboarding, eliminate "works on my machine" issues, and streamline the development workflow.

## Key Changes

This process will involve the following high-level changes:

1.  **Create a Dev Container Configuration:**
    *   A `.devcontainer` directory will be added to the project root.
    *   A new `Dockerfile` will define the complete development environment, including all necessary languages, CLIs, and tools.
    *   A `devcontainer.json` file will configure VS Code to use this container for development.

2.  **Update Docker Compose:**
    *   The `docker-compose.yml` file will be updated to include a dedicated development service.
    *   Local path mounts for toolchains and configurations (like `~/.config/solana`) will be removed.

3.  **Manage Secrets and Configuration:**
    *   Keypairs and environment variables will be managed within the container environment, with `.gitignore` updated to exclude them from source control.

4.  **Cleanup and Refactoring:**
    *   Old, service-specific Dockerfiles (like `contracts/Dockerfile`) will be removed in favor of the single dev container `Dockerfile`.
    -  The `phantom-keypair.json` will be removed.

5.  **Final Workflow:**
    *   The final workflow will involve opening the project in VS Code and using the "Reopen in Container" command to start the fully configured development environment. All commands (`anchor test`, `yarn install`, etc.) will be run inside this container.

---

## Change Log

*(This section will be updated as changes are applied.)*

### 2023-10-27: Initial Dev Container Setup

1.  **Created `delocalisation.md`**:
    *   Initialized this file to document the entire process.

2.  **Added Dev Container Configuration (`.devcontainer/`)**:
    *   Created `.devcontainer/Dockerfile` to define a unified development environment with Rust, Solana, Anchor, Node.js, and other build tools. This replaces the need for local installations.
    *   Created `.devcontainer/devcontainer.json` to configure VS Code for the container, specifying the Docker service, workspace folder, recommended extensions, and a post-create command to install dependencies.

3.  **Refactored `docker-compose.yml`**:
    *   Added a new `dev` service, which builds from the new Dockerfile and is configured to be the main development environment.
    *   Removed the old `contracts` service, as its role is now fulfilled by the `dev` service.
    *   Removed the volume mount for the local `phantom-keypair.json` to eliminate local file dependencies for the backend service.

4.  **Cleaned Up Obsolete Files**:
    *   Deleted `contracts/Dockerfile` because it is superseded by `.devcontainer/Dockerfile`.
    -   Deleted `phantom-keypair.json` as secrets will now be handled within the containerized environment.

5.  **Updated `.gitignore`**:
    *   Added `.devcontainer/` and `.vscode/` to prevent runtime configuration and user-specific files from being committed.

---

## New Development Workflow

1.  **Prerequisites**:
    *   Docker Desktop
    *   VS Code
    *   [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2.  **Getting Started**:
    *   Open the `pfm-docker` project folder in VS Code.
    *   A notification will appear asking if you want to "Reopen in Container". Click it.
    *   VS Code will build the dev container and open a new window connected to it. Your terminal will now be inside the fully configured Docker environment.

3.  **Running Commands**:
    *   All development commands (e.g., `anchor test`, `yarn install`, `npm start`) should now be run from the VS Code terminal within the dev container.
    *   To run the Solana tests, navigate to `contracts/voting` and run `anchor test`. 