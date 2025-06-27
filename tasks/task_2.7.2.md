# Task 2.7.2: Unit Tests – Membership Handlers

---

## Overview
This document details the implementation and documentation of unit tests for membership handlers in the Solana voting program. It covers tests for the `join_community`, `approve_member`, and `remove_member` instructions, including validation, access control, and edge cases.

---

## Steps Taken
1. **Wrote unit tests for joining a community:**
    - Tested successful join request by a new user.
    - Tested re-application after rejection or removal.
    - Tested prevention of duplicate pending applications.
2. **Wrote unit tests for member approval:**
    - Tested approval and rejection by admin.
    - Tested that only admin can approve/reject.
    - Tested state transitions (pending → approved/rejected).
3. **Wrote unit tests for member removal:**
    - Tested removal by admin.
    - Tested that only admin can remove members.
    - Tested removal of non-existent or already removed members.
4. **Tested error and edge cases:**
    - Attempted actions by non-admins.
    - Attempted approval/removal of members in invalid states.

---

## Rationale
- **Unit tests** ensure that membership logic is robust and correct.
- **Validation and access control** are critical for on-chain security and data integrity.
- **Edge case coverage** prevents regressions and unexpected behavior.

---

## Commands Used
- Rust/Anchor test runner (e.g., `anchor test` or `cargo test` in `contracts/voting`)
- TypeScript test runner for Anchor tests (if applicable)

---

## Errors & Edge Cases
- **Not admin:** Only admin can approve/reject/remove members.
- **Not pending:** Only pending members can be approved/rejected.
- **Not approved:** Only approved members can be removed.
- **Duplicate application:** Prevents multiple pending requests.
- **Missing input:** Should fail gracefully.

---

## Files Modified
- `contracts/voting/tests/voting.ts`: Added/updated unit tests for membership handler logic.

---

### Example: Join Community Test (TypeScript)
```ts
it('allows a user to join a community', async () => {
  const tx = await program.rpc.joinCommunity({ accounts: { /* ... */ } });
  // Fetch and assert member account state
});

it('prevents duplicate join requests', async () => {
  await program.rpc.joinCommunity({ accounts: { /* ... */ } });
  await expect(
    program.rpc.joinCommunity({ accounts: { /* ... */ } })
  ).to.be.rejectedWith(/DuplicateApplication/);
});
```

### Example: Approve/Remove Member Test
```ts
it('admin can approve a pending member', async () => {
  await program.rpc.approveMember(true, { accounts: { /* ... */ } });
  // Assert member status is approved
});

it('non-admin cannot approve member', async () => {
  await expect(
    program.rpc.approveMember(true, { accounts: { /* ... */ } })
  ).to.be.rejectedWith(/NotAdmin/);
});

it('admin can remove an approved member', async () => {
  await program.rpc.removeMember({ accounts: { /* ... */ } });
  // Assert member is removed
});
``` 