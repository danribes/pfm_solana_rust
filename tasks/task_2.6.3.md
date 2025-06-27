# Task 2.6.3: Result Query & Access Patterns

---

## Overview
This document details the implementation of result query and access patterns for voting results in the Solana voting program. It covers how clients and off-chain services can efficiently query and access aggregated voting results, both on-chain and off-chain, leveraging account scans and event subscriptions.

---

## Steps Taken
1. **Defined result query patterns:**
    - Documented how to query all `Vote` accounts for a given `VotingQuestion` using account filters (by question public key).
    - Described how to aggregate results by tallying `selected_option` fields from all relevant `Vote` accounts.
    - Outlined how to use Anchor event subscriptions (from Task 2.6.2) for real-time result updates.
2. **Provided example queries:**
    - Anchor/TypeScript example for fetching all votes for a question.
    - Example for aggregating results client-side.
    - Example for subscribing to `VoteCast` and `VotingQuestionClosed` events for live updates.
3. **Documented access patterns:**
    - On-chain: Account scan and aggregation.
    - Off-chain: Event-driven updates and periodic account scans for consistency.

---

## Rationale
- **Efficient result access:** Account filtering and event subscriptions allow clients to access up-to-date results without requiring on-chain aggregation.
- **Scalability:** Off-chain aggregation and event-driven updates scale well for large communities and frequent voting.
- **Real-time UX:** Event subscriptions enable real-time result updates in frontends and dashboards.

---

## Commands Used
- Anchor/TypeScript client code for account filtering and event subscription (see below).
- No changes to on-chain Rust code required for this subtask.

---

## Errors & Edge Cases
- **Account scan limitations:** Large numbers of votes may require paginated queries or batching.
- **Event delivery:** Off-chain indexers must handle missed events (e.g., by reconciling with account state).
- **Consistency:** Periodic full scans recommended to ensure event-driven state matches on-chain reality.

---

## Files Modified
- No on-chain code changes required for this subtask.
- Documentation only.

---

### Example: Anchor/TypeScript Query for Votes
```ts
// Fetch all Vote accounts for a given VotingQuestion
const votes = await program.account.vote.all([
  { memcmp: { offset: 8, bytes: votingQuestionPubkey.toBase58() } },
]);

// Aggregate results
const tally = {};
votes.forEach(({ account }) => {
  const option = account.selectedOption;
  tally[option] = (tally[option] || 0) + 1;
});
```

### Example: Event Subscription
```ts
// Subscribe to VoteCast events for real-time updates
program.addEventListener('VoteCast', (event, slot) => {
  // Update UI with new vote
});

// Subscribe to VotingQuestionClosed events
program.addEventListener('VotingQuestionClosed', (event, slot) => {
  // Mark question as closed in UI
});
``` 