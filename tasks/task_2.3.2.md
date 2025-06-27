# Task 2.3.2: Role Management Logic

---

## Overview
This document details the implementation of role management logic in the Solana voting program. It introduces a new instruction handler that allows the current community admin to promote a member to admin or demote an admin to member, updating both the `role` field in the `Member` account and the `admin` field in the `Community` account as needed.

---

## Steps Taken
1. **Implemented `change_member_role` handler:**
    - Only the current community admin can invoke this instruction.
    - Only approved members can be promoted or demoted.
    - Promoting a member to admin sets their `role = 1` and updates the `admin` field in the `Community` account.
    - Demoting an admin to member sets their `role = 0` (but prevents self-demotion unless another admin is assigned).
    - Emits a `MemberRoleChanged` event with all relevant details.

---

## Rationale
- **Access control** ensures only the admin can change roles.
- **Single admin model** is enforced by updating the `admin` field in the `Community` account.
- **Event emission** allows off-chain services to track role changes in real time.
- **Error handling** prevents invalid or dangerous actions (e.g., demoting self without a new admin).

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Errors & Edge Cases
- `NotAdmin`, `NotApprovedMember`, `AlreadyRole`, `CannotDemoteSelf` (see custom error codes in code).

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 