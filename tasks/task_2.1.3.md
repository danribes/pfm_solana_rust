# Task 2.1.3: Voting Instruction Handlers

---

## Overview
This document details the implementation of the instruction handlers that manage the voting process: `create_voting_question`, `cast_vote`, and `close_voting_question`.

---

## Steps Taken
1.  **Implemented `create_voting_question` handler:**
    *   Allows an `Approved` member of a community to create a new poll.
    *   Takes `question` text, a vector of `options`, and a `deadline` as input.
    *   Validates that the `question` and `options` are not empty and do not exceed length limits.
    *   Checks that the number of options does not exceed the `max_options` defined in the community config.
    *   Verifies that the creator is an `Approved` member of the community.
    *   Initializes the `VotingQuestion` account.
2.  **Implemented `cast_vote` handler:**
    *   Allows an `Approved` member to vote on an active `VotingQuestion`.
    *   Takes the `selected_option` index as input.
    *   Validates that the vote is being cast before the `deadline`.
    *   Ensures the voter is an `Approved` member of the community.
    *   Initializes a `Vote` account to record the vote, creating a PDA to ensure each member can only vote once per question.
3.  **Implemented `close_voting_question` handler:**
    *   Allows anyone to close a voting question after its `deadline` has passed.
    *   Sets the `is_active` flag on the `VotingQuestion` account to `false`.
    *   This is a cleanup function to formally end the voting period for a question.

---

## Rationale
-   **Permissioned Actions:** Only approved members can create questions and vote, ensuring the integrity of the voting process within the community.
-   **On-Chain Validation:** Constraints on deadlines, option counts, and input lengths are enforced directly in the program to maintain valid state.
-   **Immutability and Uniqueness:** Using a PDA for the `Vote` account is a robust on-chain method to enforce the "one person, one vote" rule for each question.
-   **Decentralized Cleanup:** Allowing anyone to close an expired poll removes the need for a centralized cron job or a specific user to perform the action.

---

## Files Modified
-   `contracts/voting/programs/voting/src/lib.rs` 