# Task 2.5.2: Vote Validation Logic

---

## Overview
This document details the implementation of vote validation logic in the Solana voting program. It covers comprehensive validation checks for option selection, deadlines, question status, and member eligibility.

---

## Steps Taken
1. **Implemented option validation logic:**
    - Validates that the selected option index is within the valid range (0 to options.length-1).
    - Prevents voting on non-existent options.
    - Ensures vote selection corresponds to actual question options.

2. **Implemented deadline validation:**
    - Validates that the current timestamp is before the question deadline.
    - Prevents voting on expired questions.
    - Ensures fair voting periods.

3. **Implemented question status validation:**
    - Validates that the question is still active (`is_active = true`).
    - Prevents voting on closed questions.
    - Ensures voting only occurs on valid, open questions.

4. **Implemented member status validation:**
    - Validates that the voter is an approved member (status = 1).
    - Prevents voting by pending, rejected, or removed members.
    - Ensures only active community members can vote.

---

## Rationale
- **Option validation** prevents invalid vote selections and ensures data integrity.
- **Deadline validation** maintains fair voting periods and prevents late voting.
- **Question status validation** ensures votes are only cast on active questions.
- **Member status validation** maintains community integrity and access control.

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Errors & Edge Cases
- `InvalidOption`: Selected option index is out of range.
- `DeadlinePassed`: Attempt to vote after deadline has passed.
- `NotActive`: Question is not active (closed).
- `NotApprovedMember`: Voter is not an approved member.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 