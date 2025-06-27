# Task 2.1.5: Event Emission

---

## Overview
To facilitate off-chain indexing and provide real-time updates for frontends, the program was updated to emit events for all significant state changes.

---

## Steps Taken
1.  **Defined Event Structs:** Created a unique Rust struct for each event to provide a clear, typed data structure. The following events were defined:
    *   `CommunityCreated`
    *   `MemberJoined`
    *   `MemberApproved`
    *   `MemberRemoved`
    *   `CommunityDissolved`
    *   `VotingQuestionCreated`
    *   `VoteCast`
    *   `VotingQuestionClosed`
2.  **Integrated `emit!` Macro:** In each corresponding instruction handler, the `emit!` macro was called to fire the relevant event after all logic and state changes were successfully completed.
3.  **Populated Event Data:** Each emitted event is populated with key information relevant to the action. For example, `CommunityCreated` includes the new community's public key and name, while `VoteCast` includes the public keys of the question, voter, and the selected option.

---

## Example Event Struct
```rust
#[event]
pub struct VoteCast {
    pub question: Pubkey,
    pub voter: Pubkey,
    pub selected_option: u8,
}
```

---

## Rationale
-   **Decoupling On-Chain and Off-Chain Logic:** Events are the standard way for Solana programs to communicate state changes to the outside world. Off-chain services (like a backend indexer) can listen for these specific events without having to parse entire transactions or poll accounts for changes.
-   **Real-Time Frontend Updates:** Frontends can subscribe to these events via a websocket connection to the RPC node, allowing for a dynamic and responsive user experience (e.g., updating a list of members in real-time when a `MemberApproved` event is detected).
-   **Auditability and Analytics:** A historical log of all emitted events can be stored and analyzed, providing valuable insights into community activity and a verifiable audit trail.

---

## Files Modified
-   `contracts/voting/programs/voting/src/lib.rs` 