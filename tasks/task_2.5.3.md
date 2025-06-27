# Task 2.5.3: Vote Deduplication

---

## Overview
This document details the implementation of vote deduplication in the Solana voting program. It covers the PDA-based mechanism that ensures one vote per member per question and prevents duplicate vote attempts.

---

## Steps Taken
1. **Implemented PDA-based deduplication:**
    - Uses Program Derived Address (PDA) with seeds: `[b"vote", voting_question.key().as_ref(), voter.key().as_ref()]`.
    - Creates a unique account address for each voter-question combination.
    - Ensures deterministic account generation for consistent deduplication.

2. **One vote per member per question enforcement:**
    - Each `Vote` account is uniquely identified by the combination of question and voter.
    - The `init` constraint on the vote account prevents duplicate initialization.
    - If a vote account already exists, the transaction will fail.

3. **Duplicate vote prevention:**
    - The PDA mechanism inherently prevents multiple votes from the same member on the same question.
    - No additional validation logic needed - the account system handles deduplication.
    - Gas-efficient approach using Solana's account model.

---

## Rationale
- **PDA-based approach** leverages Solana's account model for efficient deduplication.
- **Deterministic addressing** ensures consistent behavior across all transactions.
- **Gas efficiency** uses built-in account constraints rather than additional validation logic.
- **Security** prevents vote manipulation through duplicate voting.

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Errors & Edge Cases
- Account already exists error if attempting to vote twice on the same question.
- PDA derivation ensures unique vote accounts per voter-question pair.

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 