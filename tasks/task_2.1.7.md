# Task 2.1.7: Account Size Review

---

## Overview
This document provides a detailed breakdown of the on-chain space allocation for each account in the Solana voting program. All calculations include the 8-byte Anchor discriminator and a safety buffer for alignment and future extensibility.

---

### 1. `Community` Account
- **Calculation:** `8 (disc) + 32 (admin) + (4+50) (name) + (4+200) (desc) + 4 (count) + 8 (created_at) + 8 (voting_period) + 1 (max_options) = 319 bytes`
- **Final Allocation:** `368 bytes`
- **Rationale:** Provides ample space for the community name (50 chars) and description (200 chars) with a healthy safety margin.

---

### 2. `Member` Account
- **Calculation:** `8 (disc) + 32 (community) + 32 (wallet) + 1 (role) + 8 (joined_at) + 1 (status) = 82 bytes`
- **Final Allocation:** `96 bytes`
- **Rationale:** A small, fixed-size account. The buffer ensures alignment and allows for future status flags or other small fields.

---

### 3. `VotingQuestion` Account
- **Calculation:** `8 (disc) + 32 (community) + 32 (creator) + (4+256) (question) + 4 + (4 * (4+50)) (options for 4 options of 50 chars) + 8 (deadline) + 8 (created_at) + 1 (is_active) = 573 bytes`
- **Final Allocation:** `624 bytes`
- **Rationale:** This is one of the larger accounts. The allocation accounts for a long question (256 chars) and a vector of up to 4 options (50 chars each), with a safe buffer.

---

### 4. `Vote` Account
- **Calculation:** `8 (disc) + 32 (question) + 32 (voter) + 1 (selected_option) + 8 (voted_at) = 81 bytes`
- **Final Allocation:** `96 bytes`
- **Rationale:** A small, fixed-size account to record a single vote. The buffer provides alignment and safety.

---

## Conclusion
The account sizes have been reviewed and implemented in the program's `#[account(space = ...)]` macros. The current allocations are optimized for the defined data structures and validation constraints while providing a reasonable safety margin for alignment and minor future additions. Any significant changes to the data model will require another review. 