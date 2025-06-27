# Task 2.5.4: Validation & Error Handling (Vote Casting)

---

## Overview
This document summarizes the validation logic and custom error codes used in the vote casting handler of the Solana voting program.

---

## Validation Logic
- **Option Selection Validation:**
    - Selected option index must be within valid range (0 to options.length-1).
    - Prevents voting on non-existent options.
- **Deadline Validation:**
    - Current timestamp must be before the question deadline.
    - Prevents voting on expired questions.
- **Question Status Validation:**
    - Question must be active (`is_active = true`).
    - Prevents voting on closed questions.
- **Member Status Validation:**
    - Voter must be an approved member (status = 1).
    - Prevents voting by pending, rejected, or removed members.
- **Community Status Validation:**
    - Community must not be dissolved.
    - Prevents voting in defunct communities.

---

## Error Codes
- `InvalidOption`: Selected option index is out of range.
- `DeadlinePassed`: Attempt to vote after deadline has passed.
- `NotActive`: Question is not active (closed).
- `NotApprovedMember`: Voter is not an approved member.
- `CommunityDissolved`: Cannot vote in dissolved communities.

---

## Rationale
- **Explicit error codes** improve developer experience and make debugging easier.
- **Validation at the handler level** ensures on-chain state remains consistent and secure.
- **Access control** prevents unauthorized voting and maintains community integrity.
- **Comprehensive validation** ensures fair and secure voting processes.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 