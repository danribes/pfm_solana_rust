## Relevant Files

- `contracts/voting/src/lib.rs` - The core Solana smart contract for all on-chain logic.
- `contracts/voting/tests/voting.ts` - TypeScript tests for the smart contract, run with `anchor test`.
- `.devcontainer/Dockerfile` - Defines the single, unified Docker image for the development environment, containing all necessary tools (Rust, Solana, Anchor, Node.js).
- `docker-compose.yml` - Enhanced orchestration with wallet infrastructure services including PostgreSQL, Redis, Backend API, and frontend containers.
- `backend/Dockerfile` - Backend API container with wallet authentication endpoints and service integration.
- `frontend/admin/Dockerfile` - Admin portal container with wallet infrastructure and container-aware configuration.
- `frontend/member/Dockerfile` - Member portal container with wallet infrastructure and container-aware configuration.
- `backend/config/redis.conf` - Redis configuration optimized for wallet session management and caching.
- `README.md` - Project documentation and setup guide for the dev container environment.
- `backend/config/redis.js` - Redis configuration with environment-based settings and connection parameters.
- `backend/redis/connection.js` - Redis connection management with retry logic and error handling.
- `backend/redis/health.js` - Redis health monitoring and performance metrics collection.
- `backend/redis/index.js` - Main Redis module with unified interface for operations.
- `backend/tests/redis/redis.test.js` - Comprehensive test suite for Redis functionality.
- `backend/test-redis.js` - Simple validation script for Redis implementation.
- `backend/redis.env.example` - Environment variables template for Redis configuration.
- `backend/config/database.js` - Database configuration with environment-based settings.
- `backend/database/schema.sql` - PostgreSQL schema definition with all core tables and relationships.
- `backend/database/connection.js` - Database connection management and pooling.
- `backend/database/pool.js` - Connection pooling configuration.
- `backend/models/` - Database models using Sequelize ORM (User, Community, Member, VotingQuestion, Vote, Session, Analytics).
- `backend/models/index.js` - Model exports and associations.
- `backend/database/migrations/` - Database migration scripts for version control.
- `backend/database/seeders/` - Database seeding scripts for test data generation.
- `backend/tests/database/` - Comprehensive database test suite including schema, models, integration, and performance tests.
- `backend/jest.config.js` - Jest testing framework configuration.
- `backend/run-tests.js` - Test runner script with environment setup.
- `backend/session/store.js` - Redis-based session store with encryption and TTL management.
- `backend/session/auth.js` - Authentication functions for login, logout, and session refresh.
- `backend/session/security.js` - Security middleware for hijacking protection, timeout enforcement, and audit logging.
- `backend/middleware/session.js` - Express session middleware integration.
- `backend/app.js` - Main Express application with session management and API endpoints.
- `backend/test-app.js` - Integration test script for all Express endpoints.
- `backend/README.md` - Comprehensive documentation for the Express backend application.
- `backend/tests/unit/services/` - Unit test directory for backend services including communities, users, votes, and cache services.
- `backend/tests/integration/` - Integration test directory with organized structure for API, database, cache, auth, and sync testing.
- `backend/tests/fixtures/` - Test data fixtures for users, communities, and votes.
- `backend/tests/helpers/` - Test helper utilities including integration test setup and data management.
- `frontend/admin/package.json` - Admin portal container-aware configuration with health monitoring.
- `frontend/admin/docs/wireframes.md` - Comprehensive admin portal wireframes with containerization support.
- `frontend/admin/docs/containerization-considerations.md` - Admin portal container integration documentation.
- `frontend/member/package.json` - Member portal container-aware configuration with service discovery.
- `frontend/member/docs/wireframes.md` - Comprehensive member portal wireframes with responsive design.
- `frontend/member/docs/containerization-considerations.md` - Member portal container integration documentation.
- `frontend/shared/package.json` - Shared design system component library configuration.
- `frontend/shared/docs/design-system.md` - Comprehensive design system documentation with accessibility standards.
- `frontend/shared/docs/containerization-integration.md` - Container-aware component architecture documentation.
- `frontend/shared/types/wallet.ts` - TypeScript definitions for wallet connection infrastructure and state management.
- `frontend/shared/config/wallet.ts` - Wallet configuration with multi-provider support and container-aware RPC endpoints.
- `frontend/shared/utils/wallet.ts` - Utility functions for wallet operations, error handling, and container environment detection.
- `frontend/shared/contexts/WalletContext.tsx` - React context for wallet state management with container integration.
- `frontend/shared/hooks/useWallet.ts` - Custom hook providing simplified wallet functionality interface.
- `frontend/shared/components/WalletConnection/` - Complete wallet connection UI components (Button, Modal, Status, Provider).
- `frontend/shared/examples/wallet-integration-example.tsx` - Comprehensive examples for admin and member portal wallet integration.

### Notes

- All development, testing, and interaction with the project should now be done from within the VS Code Dev Container.
- To start the development environment, open the project in VS Code and select "Reopen in Container".
- **NEW**: Complete containerized environment now includes PostgreSQL, Redis, Backend API, and frontend containers with wallet infrastructure integration.
- **NEW**: Enhanced `docker-compose up -d` starts all services including wallet-enabled admin and member portals.
- For the smart contract, use `anchor test` to run all tests. Jest instructions below apply to future backend/frontend services.
- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests for backend/frontend services (to be added in future phases). Running without a path executes all tests found by the Jest configuration.
- Integration tests are located in `backend/tests/integration/` with comprehensive coverage of API, database, cache, and authentication workflows.
- Frontend wireframes and design system are fully containerized with service discovery, health monitoring, and performance optimization.
- **NEW**: Wallet infrastructure (Task 4.2.1) is fully integrated with container services (Task 4.2.3) providing complete blockchain-enabled development environment.

## Tasks

- [x] 1.0 Design and Set Up Project Architecture
  - [x] 1.1 Define service boundaries and microservice responsibilities
  - [x] 1.2 Set up monorepo or multi-repo structure for contracts, backend, and frontend
  - [x] 1.3 Create a unified Dockerfile for a development container
  - [x] 1.4 Refactor docker-compose.yml to orchestrate the dev container
  - [x] 1.5 Set up shared environment configuration and secrets management
  - [x] 1.6 Document architecture and setup in `README.md`
  - [x] 1.7 Refactor project to a fully containerized VS Code Dev Container environment

- [x] 2.0 Develop Solana Smart Contracts for Voting and Community Management

  > **Note:** Task 2.1 has been split into granular subtasks (2.1.1–2.1.8) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 2.1.1 Data Model Implementation ([task_2.1.1.md](task_2.1.1.md))
  - [x] 2.1.2 Core Membership Handlers ([task_2.1.2.md](task_2.1.2.md))
  - [x] 2.1.3 Voting Instruction Handlers ([task_2.1.3.md](task_2.1.3.md))
  - [x] 2.1.4 Admin & Edge Case Handlers ([task_2.1.4.md](task_2.1.4.md))
  - [x] 2.1.5 Event Emission ([task_2.1.5.md](task_2.1.5.md))
  - [x] 2.1.6 Instruction API Documentation ([task_2.1.6.md](task_2.1.6.md))
  - [x] 2.1.7 Account Size Review ([task_2.1.7.md](task_2.1.7.md))
  - [x] 2.1.8 Test Stubbing ([task_2.1.8.md](task_2.1.8.md))

  > **Note:** Task 2.2 has been split into granular subtasks (2.2.1–2.2.5) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 2.2.1 Community Creation Handler ([task_2.2.1.md](task_2.2.1.md))
  - [x] 2.2.2 Community Configuration Update Handler ([task_2.2.2.md](task_2.2.2.md))
  - [x] 2.2.3 Validation & Error Handling ([task_2.2.3.md](task_2.2.3.md))
  - [x] 2.2.4 Tests for Community Creation & Config ([task_2.2.4.md](task_2.2.4.md))
  - [x] 2.2.5 Documentation & API Updates ([task_2.2.5.md](task_2.2.5.md))

  > **Note:** Task 2.3 has been split into granular subtasks (2.3.1–2.3.5) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 2.3.1 Membership Approval Handler ([task_2.3.1.md](task_2.3.1.md))
  - [x] 2.3.2 Role Management Logic ([task_2.3.2.md](task_2.3.2.md))
  - [x] 2.3.3 Validation & Error Handling ([task_2.3.3.md](task_2.3.3.md))
  - [x] 2.3.4 Tests for Membership Approval & Role Management ([task_2.3.4.md](task_2.3.4.md))
  - [x] 2.3.5 Documentation & API Updates ([task_2.3.5.md](task_2.3.5.md))

  > **Note:** Task 2.4 has been split into granular subtasks (2.4.1–2.4.5) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 2.4.1 Voting Question Creation Handler ([task_2.4.1.md](task_2.4.1.md))
  - [x] 2.4.2 Question Options Management ([task_2.4.2.md](task_2.4.2.md))
  - [x] 2.4.3 Deadline Management ([task_2.4.3.md](task_2.4.3.md))
  - [x] 2.4.4 Validation & Error Handling ([task_2.4.4.md](task_2.4.4.md))
  - [x] 2.4.5 Tests for Voting Question Creation ([task_2.4.5.md](task_2.4.5.md))

  > **Note:** Task 2.5 has been split into granular subtasks (2.5.1–2.5.5) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 2.5.1 Vote Casting Handler ([task_2.5.1.md](task_2.5.1.md))
  - [x] 2.5.2 Vote Validation Logic ([task_2.5.2.md](task_2.5.2.md))
  - [x] 2.5.3 Vote Deduplication ([task_2.5.3.md](task_2.5.3.md))
  - [x] 2.5.4 Validation & Error Handling ([task_2.5.4.md](task_2.5.4.md))
  - [x] 2.5.5 Tests for Vote Casting ([task_2.5.5.md](task_2.5.5.md))

  > **Note:** Task 2.6 has been split into granular subtasks (2.6.1–2.6.5) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 2.6.1 On-Chain Result Aggregation Logic ([task_2.6.1.md](task_2.6.1.md))
  - [x] 2.6.2 Real-Time Result Event Emission ([task_2.6.2.md](task_2.6.2.md))
  - [x] 2.6.3 Result Query & Access Patterns ([task_2.6.3.md](task_2.6.3.md))
  - [x] 2.6.4 Validation & Error Handling ([task_2.6.4.md](task_2.6.4.md))
  - [x] 2.6.5 Tests for Result Aggregation ([task_2.6.5.md](task_2.6.5.md))

  > **Note:** Task 2.7 has been split into granular subtasks (2.7.1–2.7.6) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 2.7.1 Unit Tests: Community Creation & Config ([task_2.7.1.md](task_2.7.1.md))
  - [x] 2.7.2 Unit Tests: Membership Handlers ([task_2.7.2.md](task_2.7.2.md))
  - [x] 2.7.3 Unit Tests: Voting Handlers ([task_2.7.3.md](task_2.7.3.md))
  - [x] 2.7.4 Integration Tests: End-to-End Voting Flows ([task_2.7.4.md](task_2.7.4.md))
  - [x] 2.7.5 Edge Case & Error Handling Tests ([task_2.7.5.md](task_2.7.5.md))
  - [x] 2.7.6 Test Coverage & Summary ([task_2.7.6.md](task_2.7.6.md))
  - [x] 2.7.7 Future Test Enhancements & Maintenance ([task_2.7.7.md](task_2.7.7.md))

- [x] 3.0 Implement Backend Services (API, Database, Caching)

  > **Note:** Task 3.1 has been split into granular subtasks (3.1.1–3.1.5) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.1.1 Database Schema Design ([task_3.1.1.md](task_3.1.1.md))
  - [x] 3.1.2 Database Connection & Configuration ([task_3.1.2.md](task_3.1.2.md))
  - [x] 3.1.3 Database Models & ORM Integration ([task_3.1.3.md](task_3.1.3.md))
  - [x] 3.1.4 Database Seeding & Testing Data ([task_3.1.4.md](task_3.1.4.md))
  - [x] 3.1.5 Database Testing & Validation ([task_3.1.5.md](task_3.1.5.md))

  > **Note:** Task 3.2 has been split into granular subtasks (3.2.1–3.2.3) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.2.1 Redis Configuration & Connection Setup ([task_3.2.1.md](task_3.2.1.md))
  - [x] 3.2.2 Session Management Implementation ([task_3.2.2.md](task_3.2.2.md))
  - [x] 3.2.3 Caching Strategy Implementation ([task_3.2.3.md](task_3.2.3.md))

  > **Note:** Task 3.3 has been split into granular subtasks (3.3.1–3.3.3) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.3.1 Community Management API Endpoints ([task_3.3.1.md](task_3.3.1.md))
  - [x] 3.3.2 Membership Management API Endpoints ([task_3.3.2.md](task_3.3.2.md))
  - [x] 3.3.3 User Profile & Authentication API Endpoints ([task_3.3.3.md](task_3.3.3.md))

  > **Note:** Task 3.4 has been split into granular subtasks (3.4.1–3.4.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.4.1 Voting Question Management API Endpoints ([task_3.4.1.md](task_3.4.1.md))
  - [x] 3.4.2 Voting Operations API Endpoints ([task_3.4.2.md](task_3.4.2.md))

  > **Note:** Task 3.5 has been split into granular subtasks (3.5.1–3.5.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.5.1 Wallet-Based Authentication System ([task_3.5.1.md](task_3.5.1.md))
  - [x] 3.5.2 Session Management & Security ([task_3.5.2.md](task_3.5.2.md))

  > **Note:** Task 3.6 has been split into granular subtasks (3.6.1–3.6.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.6.1 Solana Blockchain Integration ([task_3.6.1.md](task_3.6.1.md))
  - [x] 3.6.2 Backend-Smart Contract Synchronization ([task_3.6.2.md](task_3.6.2.md))

  > **Note:** Task 3.7 has been split into granular subtasks (3.7.1–3.7.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.7.1 Analytics & Reporting Endpoints ([task_3.7.1.md](task_3.7.1.md))
  - [x] 3.7.2 Data Aggregation & Processing ([task_3.7.2.md](task_3.7.2.md))

  > **Note:** Task 3.8 has been split into granular subtasks (3.8.1–3.8.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 3.8.1 Backend Unit Tests ([task_3.8.1.md](task_3.8.1.md))
  - [x] 3.8.2 Backend Integration Tests ([task_3.8.2.md](task_3.8.2.md))

- [ ] 4.0 Build Admin and Member Web Interfaces

  > **Note:** Task 4.1 has been split into granular subtasks (4.1.1–4.1.3) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 4.1.1 Admin Portal UI Wireframes ([task_4.1.1.md](task_4.1.1.md))
  - [x] 4.1.2 Member Portal UI Wireframes ([task_4.1.2.md](task_4.1.2.md))
  - [x] 4.1.3 Shared Design System & Component Wireframes ([task_4.1.3.md](task_4.1.3.md))

  > **Note:** Task 4.2 has been split into granular subtasks (4.2.1–4.2.3) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [x] 4.2.1 Wallet Connection Infrastructure ([task_4.2.1.md](task_4.2.1.md))
  - [x] 4.2.2 Authentication Flows & Session Management ([task_4.2.2.md](task_4.2.2.md))
  - [x] 4.2.3 Container Service Integration with Wallet Infrastructure ([task_4.2.3.md](task_4.2.3.md))

  > **Note:** Task 4.3 has been split into granular subtasks (4.3.1–4.3.4) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 4.3.1 Admin Dashboard Layout & Navigation ([task_4.3.1.md](task_4.3.1.md))
  - [ ] 4.3.2 Community Management Features ([task_4.3.2.md](task_4.3.2.md))
  - [ ] 4.3.3 Member Approval & Management ([task_4.3.3.md](task_4.3.3.md))
  - [ ] 4.3.4 Analytics & Reporting Dashboard ([task_4.3.4.md](task_4.3.4.md))

  > **Note:** Task 4.4 has been split into granular subtasks (4.4.1–4.4.4) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 4.4.1 Member Portal Layout & Navigation ([task_4.4.1.md](task_4.4.1.md))
  - [ ] 4.4.2 Community Browser & Discovery ([task_4.4.2.md](task_4.4.2.md))
  - [ ] 4.4.3 Voting Interface & Interaction ([task_4.4.3.md](task_4.4.3.md))
  - [ ] 4.4.4 Results Visualization & Analytics ([task_4.4.4.md](task_4.4.4.md))

  > **Note:** Task 4.5 has been split into granular subtasks (4.5.1) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 4.5.1 Real-Time Results Visualization ([task_4.5.1.md](task_4.5.1.md))

  > **Note:** Task 4.6 has been split into granular subtasks (4.6.1–4.6.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 4.6.1 Mobile-First Responsive Design ([task_4.6.1.md](task_4.6.1.md))
  - [ ] 4.6.2 Accessibility Compliance ([task_4.6.2.md](task_4.6.2.md))

  > **Note:** Task 4.7 has been split into granular subtasks (4.7.1–4.7.3) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 4.7.1 Frontend Unit Tests ([task_4.7.1.md](task_4.7.1.md))
  - [ ] 4.7.2 Frontend Integration Tests ([task_4.7.2.md](task_4.7.2.md))
  - [ ] 4.7.3 Frontend End-to-End Tests ([task_4.7.3.md](task_4.7.3.md))

- [ ] 5.0 Integrate Blockchain, Authentication, and Real-Time Features

  > **Note:** Task 5.1 has been split into granular subtasks (5.1.1–5.1.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 5.1.1 Frontend-Backend Integration with Smart Contracts ([task_5.1.1.md](task_5.1.1.md))
  - [ ] 5.1.2 Cross-Portal Integration & Data Consistency ([task_5.1.2.md](task_5.1.2.md))

  > **Note:** Task 5.2 has been split into granular subtasks (5.2.1–5.2.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 5.2.1 WebSocket Infrastructure for Real-Time Updates ([task_5.2.1.md](task_5.2.1.md))
  - [ ] 5.2.2 Real-Time Notification System ([task_5.2.2.md](task_5.2.2.md))

  > **Note:** Task 5.3 has been split into granular subtasks (5.3.1–5.3.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 5.3.1 End-to-End Wallet-Based Authentication Flow ([task_5.3.1.md](task_5.3.1.md))
  - [ ] 5.3.2 Session Security & Management ([task_5.3.2.md](task_5.3.2.md))

  > **Note:** Task 5.4 has been split into granular subtasks (5.4.1–5.4.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 5.4.1 Blockchain Error Handling & Recovery ([task_5.4.1.md](task_5.4.1.md))
  - [ ] 5.4.2 Fallback Mechanisms & Offline Support ([task_5.4.2.md](task_5.4.2.md))

  > **Note:** Task 5.5 has been split into granular subtasks (5.5.1–5.5.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 5.5.1 Analytics Integration & Tracking ([task_5.5.1.md](task_5.5.1.md))
  - [ ] 5.5.2 Notification System Integration ([task_5.5.2.md](task_5.5.2.md))

- [ ] 6.0 Set Up CI/CD, Testing, and Deployment Pipelines

  > **Note:** Task 6.1 has been split into granular subtasks (6.1.1–6.1.3) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 6.1.1 Automated Contract Tests in CI ([task_6.1.1.md](task_6.1.1.md))
  - [ ] 6.1.2 Automated Backend Tests in CI ([task_6.1.2.md](task_6.1.2.md))
  - [ ] 6.1.3 Automated Frontend Tests in CI ([task_6.1.3.md](task_6.1.3.md))

  > **Note:** Task 6.2 has been split into granular subtasks (6.2.1–6.2.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 6.2.1 CI Pipeline Structure & Workflow Design ([task_6.2.1.md](task_6.2.1.md))
  - [ ] 6.2.2 CD Pipeline Structure & Deployment Automation ([task_6.2.2.md](task_6.2.2.md))

  > **Note:** Task 6.3 has been split into granular subtasks (6.3.1) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 6.3.1 Staging & Production Environment Setup (Cloud-Agnostic) ([task_6.3.1.md](task_6.3.1.md))

  > **Note:** Task 6.4 has been split into granular subtasks (6.4.1–6.4.2) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 6.4.1 Monitoring & Alerting for All Services ([task_6.4.1.md](task_6.4.1.md))
  - [ ] 6.4.2 Logging Best Practices & Log Management ([task_6.4.2.md](task_6.4.2.md))

  > **Note:** Task 6.5 has been split into granular subtasks (6.5.1) for clarity and traceability. Each subtask is documented in its own markdown file in `/tasks`.

  - [ ] 6.5.1 Deployment & Operational Documentation ([task_6.5.1.md](task_6.5.1.md))

> **Planned Future Phases:**
> 
> Tasks 4.x and beyond (Frontend, Integration, CI/CD, etc.) are planned for future development and are not yet implemented in the current codebase. These sections serve as a roadmap for upcoming work. 

docker-compose up -d
# Access: http://localhost:3001 (Admin) & http://localhost:3002 (Member) 