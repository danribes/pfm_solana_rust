# Task 2.2.1: Community Creation Handler

---

## Overview
This document details the implementation of the `create_community` instruction in the Solana voting program. This handler is responsible for initializing a new community, validating input, and emitting the appropriate event.

---

## Steps Taken
1. **Implemented `create_community` handler:**
    - Accepts `name`, `description`, and `config` as input parameters.
    - Validates that the name and description do not exceed maximum lengths (32 and 256 chars, respectively).
    - Validates that the voting period is positive and the number of options is between 2 and 4.
    - Initializes the `Community` account, sets the admin, and records the creation timestamp.
    - Sets the initial `member_count` to 1 (for the admin).
    - Emits a `CommunityCreated` event with relevant details.

---

## Rationale
- **Input validation** ensures only valid data is stored on-chain, preventing state corruption.
- **Admin assignment** at creation time establishes clear authority for future actions.
- **Event emission** allows off-chain services to track new communities in real time.

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Errors & Edge Cases
- `NameTooLong`, `DescriptionTooLong`, `InvalidVotingPeriod`, `InvalidMaxOptions` (see custom error codes in code).

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 