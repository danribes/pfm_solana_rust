# Task 2.3.3: Validation & Error Handling (Membership Approval & Role Management)

---

## Overview
This document summarizes the validation logic and custom error codes used in the membership approval and role management handlers of the Solana voting program.

---

## Validation Logic
- **Membership Approval:**
    - Only the community admin can approve or reject members.
    - Only members with `status = 0` (pending) can be approved or rejected.
- **Role Management:**
    - Only the current admin can change member roles.
    - Only approved members can be promoted or demoted.
    - Cannot demote self without assigning a new admin.
    - No-op if the member is already the desired role.

---

## Error Codes
- `NotAdmin`: Only the community admin can approve/reject members or change roles.
- `NotPending`: Only pending members can be approved/rejected.
- `NotApprovedMember`: Only approved members can be promoted/demoted.
- `AlreadyRole`: Target member is already the desired role.
- `CannotDemoteSelf`: Admin cannot demote themselves without assigning a new admin.

---

## Rationale
- **Explicit error codes** improve developer experience and make debugging easier.
- **Validation at the handler level** ensures on-chain state remains consistent and secure.
- **Access control** prevents unauthorized or dangerous actions.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 