# Task 2.4.1: Voting Question Creation Handler

---

## Overview
This document details the implementation of the `create_voting_question` instruction in the Solana voting program. This handler is responsible for creating new voting questions with validation, access control, and event emission.

---

## Steps Taken
1. **Implemented `create_voting_question` handler:**
    - Accepts `question` text, `options` vector, and `deadline` as input parameters.
    - Validates that the question text does not exceed maximum length (256 chars).
    - Validates that the number of options is between 2 and 4 (inclusive).
    - Validates that the deadline is in the future.
    - Ensures only approved members can create questions.
    - Prevents creation in dissolved communities.
    - Initializes the `VotingQuestion` account with all provided data.
    - Sets `is_active` to `true` and records creation timestamp.
    - Emits a `VotingQuestionCreated` event with relevant details.

---

## Rationale
- **Access control** ensures only approved members can create questions, maintaining community integrity.
- **Input validation** prevents invalid data from being stored on-chain.
- **Deadline validation** ensures questions have meaningful voting periods.
- **Event emission** allows off-chain services to track new questions in real time.

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Errors & Edge Cases
- `QuestionTooLong`, `TooManyOptions`, `InvalidDeadline`, `NotApprovedMember`, `CommunityDissolved` (see custom error codes in code).

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 