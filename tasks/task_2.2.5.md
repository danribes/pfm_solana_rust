# Task 2.2.5: Documentation & API Updates

---

## Overview
This document provides the instruction API for community creation and configuration update, intended for backend/frontend integration.

---

## Instruction: `create_community`
- **Parameters:**
    - `name: String`
    - `description: String`
    - `config: CommunityConfig`
- **Accounts:**
    - `community`: The new community account to be initialized.
    - `admin`: The community creator (payer and signer).
    - `system_program`: Required for account creation.
- **Event Emitted:** `CommunityCreated`

---

## Instruction: `update_community_config`
- **Parameters:**
    - `new_config: CommunityConfig`
- **Accounts:**
    - `community`: The community account to be updated.
    - `admin`: The community admin (signer).
- **Event Emitted:** (Optional) `CommunityConfigUpdated`

---

## Example Usage
- See `contracts/voting/tests/voting.ts` for test-driven usage examples.

---

## Integration Notes
- Ensure the admin wallet is used for config updates.
- Validate input on the client side to avoid on-chain errors.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 