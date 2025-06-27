# Task 2.4.3: Deadline Management

---

## Overview
This document details the implementation of deadline management for voting questions in the Solana voting program. It covers future deadline validation, integration with community configuration, and deadline enforcement logic.

---

## Steps Taken
1. **Implemented deadline validation logic:**
    - Validates that the deadline is in the future (greater than current timestamp).
    - Ensures questions have meaningful voting periods.
    - Prevents creation of questions with immediate or past deadlines.

2. **Deadline enforcement mechanisms:**
    - Deadline is stored as Unix timestamp in the `VotingQuestion` account.
    - Used in `cast_vote` handler to prevent voting after deadline.
    - Used in `close_voting_question` handler to allow closure after deadline.
    - Integration with community `voting_period` configuration for future extensibility.

3. **Deadline-related constraints:**
    - Questions cannot be created with deadlines in the past.
    - Voting is automatically prevented after deadline passes.
    - Questions can be closed by anyone after deadline has passed.

---

## Rationale
- **Future deadline requirement** ensures questions have meaningful voting periods.
- **Timestamp-based storage** provides precise deadline tracking.
- **Automatic enforcement** prevents voting on expired questions.
- **Community config integration** allows for flexible voting period settings.

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Errors & Edge Cases
- `InvalidDeadline`: Deadline is not in the future.
- `DeadlinePassed`: Attempt to vote after deadline has passed.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 