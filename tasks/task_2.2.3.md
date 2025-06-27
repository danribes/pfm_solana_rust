# Task 2.2.3: Validation & Error Handling

---

## Overview
This document summarizes the validation logic and custom error codes used in the community creation and configuration update handlers.

---

## Validation Logic
- **Name length:** Max 32 characters for community name.
- **Description length:** Max 256 characters for community description.
- **Voting period:** Must be positive.
- **Max options:** Must be between 2 and 4 (inclusive).
- **Access control:** Only the admin can update configuration.

---

## Error Codes
- `NameTooLong`: Community name exceeds allowed length.
- `DescriptionTooLong`: Community description exceeds allowed length.
- `InvalidVotingPeriod`: Voting period must be positive.
- `InvalidMaxOptions`: Number of voting options must be 2–4.
- `NotAdmin`: Only the community admin can update configuration.

---

## Rationale
- **Explicit error codes** improve developer experience and make debugging easier.
- **Validation at the handler level** ensures on-chain state remains consistent and secure.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 