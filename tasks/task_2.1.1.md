# Task 2.1.1: Data Model Implementation

---

## Overview
This document summarizes the on-chain data model for the Solana voting program, as implemented in `contracts/voting/programs/voting/src/lib.rs`. It describes the main accounts, their fields, and the rationale for each.

---

## Account Structs

### 1. CommunityConfig (Helper Struct)
```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct CommunityConfig {
    pub voting_period: i64, // Voting period in seconds
    pub max_options: u8,    // Maximum number of options per question (e.g., 4)
}
```
**Rationale:** Holds configuration for voting rules, such as how long votes last and how many options are allowed.

---

### 2. Community Account
```rust
#[account]
pub struct Community {
    pub admin: Pubkey,           // Community admin/creator
    pub name: String,            // Community name
    pub description: String,     // Community description
    pub member_count: u32,       // Number of approved members
    pub created_at: i64,         // Timestamp
    pub config: CommunityConfig, // Voting rules/config
}
```
**Rationale:** Represents a community, its admin, metadata, and voting configuration.

---

### 3. Member Account
```rust
#[account]
pub struct Member {
    pub community: Pubkey, // Reference to Community
    pub wallet: Pubkey,    // Member's wallet address
    pub role: u8,          // 0 = member, 1 = admin
    pub joined_at: i64,    // Timestamp
    pub status: u8,        // 0 = pending, 1 = approved, 2 = rejected
}
```
**Rationale:** Represents a member of a community, their wallet, role, and status.

---

### 4. VotingQuestion Account
```rust
#[account]
pub struct VotingQuestion {
    pub community: Pubkey,     // Reference to Community
    pub creator: Pubkey,       // Creator of the question
    pub question: String,      // The question text
    pub options: Vec<String>,  // Up to 4 options
    pub deadline: i64,         // Voting deadline (timestamp)
    pub created_at: i64,       // Timestamp
    pub is_active: bool,       // Is the question active?
}
```
**Rationale:** Represents a voting question, its options, and metadata.

---

### 5. Vote Account
```rust
#[account]
pub struct Vote {
    pub question: Pubkey,      // Reference to VotingQuestion
    pub voter: Pubkey,         // Voter's wallet address
    pub selected_option: u8,   // Index of selected option
    pub voted_at: i64,         // Timestamp
}
```
**Rationale:** Represents a single vote by a member on a question.

---

## Relationships
- Each **Member** belongs to a **Community**.
- Each **VotingQuestion** belongs to a **Community** and is created by a member.
- Each **Vote** is linked to a **VotingQuestion** and a member (voter).

---

## Notes
- All structs use Anchor macros for serialization and on-chain storage.
- String and Vec fields should have maximum lengths enforced in instruction handlers to avoid exceeding Solana account size limits.
- The data model is designed for extensibility and clarity, supporting core community and voting operations. 