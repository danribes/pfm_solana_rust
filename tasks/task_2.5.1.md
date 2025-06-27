# Task 2.5.1: Vote Casting Handler

---

## Overview
This document details the implementation of the `cast_vote` instruction in the Solana voting program. This handler is responsible for recording votes with comprehensive validation, access control, and event emission.

---

## Steps Taken
1. **Implemented `cast_vote` handler:**
    - Accepts `selected_option` index as input parameter.
    - Validates that the selected option is within the valid range (0 to options.length-1).
    - Ensures only approved members can vote.
    - Prevents voting in dissolved communities.
    - Validates that the question is still active.
    - Validates that the voting deadline has not passed.
    - Initializes the `Vote` account with all vote details.
    - Records the vote timestamp.
    - Emits a `VoteCast` event with relevant details.

---

## Rationale
- **Access control** ensures only approved members can vote, maintaining community integrity.
- **Comprehensive validation** prevents invalid votes and ensures data consistency.
- **Deadline enforcement** ensures fair voting periods.
- **Event emission** allows off-chain services to track votes in real time.

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Errors & Edge Cases
- `InvalidOption`, `NotActive`, `DeadlinePassed`, `NotApprovedMember`, `CommunityDissolved` (see custom error codes in code).

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 