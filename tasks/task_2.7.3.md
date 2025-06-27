# Task 2.7.3: Unit Tests – Voting Handlers

---

## Overview
This document details the implementation and documentation of unit tests for voting handlers in the Solana voting program. It covers tests for the `create_voting_question`, `cast_vote`, and `close_voting_question` instructions, including validation, access control, and edge cases.

---

## Steps Taken
1. **Wrote unit tests for creating voting questions:**
    - Tested successful creation by approved members.
    - Tested validation for question text, options count, and deadline.
    - Tested prevention of question creation by non-members or in dissolved communities.
2. **Wrote unit tests for casting votes:**
    - Tested successful vote casting by approved members.
    - Tested validation for option index, deadline, and question status.
    - Tested prevention of duplicate votes (PDA logic).
3. **Wrote unit tests for closing voting questions:**
    - Tested successful closure after deadline.
    - Tested that only closed after deadline, and anyone can close.
    - Tested prevention of closure before deadline.
4. **Tested error and edge cases:**
    - Attempted actions by unauthorized users.
    - Attempted voting on closed or expired questions.
    - Attempted creation with invalid parameters.

---

## Rationale
- **Unit tests** ensure that voting logic is robust and correct.
- **Validation and access control** are critical for on-chain security and data integrity.
- **Edge case coverage** prevents regressions and unexpected behavior.

---

## Commands Used
- Rust/Anchor test runner (e.g., `anchor test` or `cargo test` in `contracts/voting`)
- TypeScript test runner for Anchor tests (if applicable)

---

## Errors & Edge Cases
- **Not approved member:** Only approved members can create questions or vote.
- **Invalid option:** Vote must be for a valid option index.
- **Deadline passed:** Cannot vote or close before/after deadline as appropriate.
- **Duplicate vote:** Only one vote per member per question.
- **Community dissolved:** Cannot create questions in dissolved communities.
- **Missing input:** Should fail gracefully.

---

## Files Modified
- `contracts/voting/tests/voting.ts`: Added/updated unit tests for voting handler logic.

---

### Example: Create Voting Question Test (TypeScript)
```ts
it('allows approved member to create a voting question', async () => {
  const tx = await program.rpc.createVotingQuestion(
    'Should we adopt proposal X?',
    ['Yes', 'No'],
    futureDeadline,
    { accounts: { /* ... */ } }
  );
  // Fetch and assert question account state
});

it('prevents non-member from creating question', async () => {
  await expect(
    program.rpc.createVotingQuestion(
      'Should we adopt proposal X?',
      ['Yes', 'No'],
      futureDeadline,
      { accounts: { /* ... */ } }
    )
  ).to.be.rejectedWith(/NotApprovedMember/);
});
```

### Example: Cast Vote & Close Question Test
```ts
it('allows approved member to cast a vote', async () => {
  await program.rpc.castVote(0, { accounts: { /* ... */ } });
  // Assert vote account created
});

it('prevents duplicate vote', async () => {
  await program.rpc.castVote(0, { accounts: { /* ... */ } });
  await expect(
    program.rpc.castVote(0, { accounts: { /* ... */ } })
  ).to.be.rejectedWith(/DuplicateVote/);
});

it('allows anyone to close question after deadline', async () => {
  await program.rpc.closeVotingQuestion({ accounts: { /* ... */ } });
  // Assert question is closed
});
``` 