  # Task: Environment Management in the Dev Container

  ---

  ## Purpose
  This document explains how to manage environment variables and Solana keypairs within the fully containerized development environment. All development, testing, and deployment activities should be performed from within the VS Code Dev Container, which comes pre-configured with all necessary tools.

  ---

  ## Solana Wallet Management

  The dev container has its own isolated Solana CLI and Anchor installation. The keypairs used inside the container are separate from any keypairs on your host machine.

  ### Default Wallet for `anchor test`
  When you run `anchor test`, the command automatically generates and funds a temporary wallet to act as the provider/payer for the test run. You do not need to create or specify a keypair for testing.

  ### Creating a Persistent Keypair

  If you need a persistent keypair for deploying to a public network (like Devnet or Mainnet) or for interacting with other on-chain programs, you should generate it *inside the workspace directory*. This ensures it persists when you restart the container.

  1.  **Open a terminal in the dev container.**
  2.  **Create a directory for your keypairs:**
      ```sh
      mkdir -p /workspace/.keypairs
      ```
  3.  **Generate a new keypair:**
      ```sh
      solana-keygen new --outfile /workspace/.keypairs/user-keypair.json --no-bip39-passphrase
      ```
  4.  **Set it as the default (optional):**
      ```sh
      solana config set --keypair /workspace/.keypairs/user-keypair.json
      ```
      Anchor and the Solana CLI will now use this keypair for commands like `anchor deploy`.

  **Security Note:** The `.gitignore` file is configured to ignore the `.keypairs/` directory, so you will not accidentally commit your private keys.

  ---

  ## Environment Variables (`.env`)

  The current smart contract project does not require any environment variables to function.

  As the project grows to include a backend API or frontend services, environment variables can be managed using a `.env` file in the project root. The `docker-compose.yml` can be configured to load this file and pass the variables to the relevant services. This will be documented when those services are added.

  ---

  ## Best Practices for Production

  While not immediately applicable to the current smart contract, it is crucial to follow security best practices for a production environment.

  1.  **Use a Secrets Manager:** For production, never store private keys or sensitive credentials in `.env` files. Use a dedicated secrets manager like AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault.
  2.  **Inject Secrets at Runtime:** Secrets should be securely injected into your production containers at runtime, not built into the Docker image.
  3.  **Principle of Least Privilege:** Grant services and users the minimum access they require.
  4.  **Rotate Secrets:** Regularly rotate all credentials and keys.
  5.  **Audit and Monitor:** Log and alert on all access to secrets.