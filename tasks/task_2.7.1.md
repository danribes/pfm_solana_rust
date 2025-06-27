# Task 2.7.1: Unit Tests – Community Creation & Config

---

## Overview
This document details the implementation and documentation of unit tests for community creation and configuration update logic in the Solana voting program. It covers tests for the `create_community` and `update_community_config` instructions, including validation, access control, and edge cases.

---

## Steps Taken
1. **Wrote unit tests for community creation:**
    - Tested successful creation with valid parameters.
    - Tested failure on invalid name/description lengths.
    - Tested duplicate community creation prevention (if applicable).
2. **Wrote unit tests for configuration update:**
    - Tested successful config update by admin.
    - Tested failure when non-admin attempts update.
    - Tested validation for invalid voting period and max options.
3. **Tested error and edge cases:**
    - Attempted config update with invalid parameters.
    - Attempted creation with missing or malformed input.

---

## Rationale
- **Unit tests** ensure that core community logic is robust and correct.
- **Validation and access control** are critical for on-chain security and data integrity.
- **Edge case coverage** prevents regressions and unexpected behavior.

---

## Commands Used
- Rust/Anchor test runner (e.g., `anchor test` or `cargo test` in `contracts/voting`)
- TypeScript test runner for Anchor tests (if applicable)

---

## Errors & Edge Cases
- **Name/description too long:** Should fail with `NameTooLong` or `DescriptionTooLong`.
- **Invalid voting period:** Should fail with `InvalidVotingPeriod`.
- **Invalid max options:** Should fail with `InvalidMaxOptions`.
- **Not admin:** Only admin can update config.
- **Missing input:** Should fail gracefully.

---

## Files Modified
- `contracts/voting/tests/voting.ts`: Added/updated unit tests for community creation and config update logic.

---

### Example: Community Creation Test (TypeScript)
```ts
it('creates a community with valid parameters', async () => {
  const tx = await program.rpc.createCommunity(
    'Test Community',
    'A test community for unit testing',
    { votingPeriod: 86400, maxOptions: 3 },
    { accounts: { /* ... */ } }
  );
  // Fetch and assert community account state
});

it('fails to create community with too long name', async () => {
  await expect(
    program.rpc.createCommunity(
      'X'.repeat(100), // too long
      'desc',
      { votingPeriod: 86400, maxOptions: 3 },
      { accounts: { /* ... */ } }
    )
  ).to.be.rejectedWith(/NameTooLong/);
});
```

### Example: Config Update Test
```ts
it('updates config as admin', async () => {
  await program.rpc.updateCommunityConfig(
    { votingPeriod: 43200, maxOptions: 2 },
    { accounts: { /* ... */ } }
  );
  // Fetch and assert updated config
});

it('fails to update config as non-admin', async () => {
  await expect(
    program.rpc.updateCommunityConfig(
      { votingPeriod: 43200, maxOptions: 2 },
      { accounts: { /* ... */ } }
    )
  ).to.be.rejectedWith(/NotAdmin/);
});
``` 