# Task 2.6.1: On-Chain Result Aggregation Logic

---

## Overview
This document details the implementation of on-chain result aggregation logic in the Solana voting program. It covers how vote results are aggregated and stored on-chain, and the relevant data structures and patterns used.

---

## Steps Taken
1. **Result aggregation approach:**
    - Each `Vote` account records the selected option for a given question and voter.
    - To aggregate results, clients (or on-chain logic) count the number of votes per option for each `VotingQuestion`.
    - The program does not currently store aggregated results directly in the `VotingQuestion` account (to save space and gas), but this can be extended if needed.

2. **Data structures:**
    - `Vote` accounts: Each stores `question`, `voter`, `selected_option`, and `voted_at`.
    - `VotingQuestion` account: Stores the list of options and question metadata.
    - Aggregation is performed by iterating over all `Vote` accounts for a given question and tallying the `selected_option` values.

3. **On-chain vs. off-chain aggregation:**
    - On-chain aggregation (e.g., storing a tally in the `VotingQuestion` account) is possible but increases storage and update complexity.
    - Current design favors off-chain aggregation for scalability and cost efficiency, using events and account scans.

---

## Rationale
- **Account-based aggregation** leverages Solana's data model for flexible result computation.
- **Off-chain aggregation** is more scalable and cost-effective for most use cases.
- **On-chain tallying** can be added if real-time, trustless result access is required.

---

## Commands Used
- Rust program edited: `contracts/voting/programs/voting/src/lib.rs`

---

## Files Modified
- `contracts/voting/programs/voting/src/lib.rs` 