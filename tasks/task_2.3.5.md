# Task 2.3.5: Documentation & API Updates (Membership Approval & Role Management)

---

## Overview
This document provides the instruction API for membership approval and role management, intended for backend/frontend integration.

---

## Instruction: `approve_member`
- **Parameters:**
    - `approve: bool` (true = approve, false = reject)
- **Accounts:**
    - `community`: The community the member belongs to.
    - `member`: The member account being approved/rejected.
    - `admin`: The community admin (signer).
- **Event Emitted:** `MemberApproved`

---

## Instruction: `change_member_role`
- **Parameters:**
    - `new_role: u8` (0 = member, 1 = admin)
- **Accounts:**
    - `community`: The community the member belongs to.
    - `member`: The member account being promoted/demoted.
    - `admin`: The current community admin (signer).
- **Event Emitted:** `MemberRoleChanged`

---

## Example Usage
- See `contracts/voting/tests/voting.ts` for test-driven usage examples.

---

## Integration Notes
- Ensure the admin wallet is used for both approval and role management.
- Validate input on the client side to avoid on-chain errors.
- Monitor emitted events for real-time updates.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 