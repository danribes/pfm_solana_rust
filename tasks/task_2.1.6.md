# Task 2.1.6: Instruction API Documentation

---

## Overview
This document describes the instruction API for the Solana voting program. It is intended for backend and frontend developers who need to integrate with the smart contract. Each instruction corresponds to a public function in the `lib.rs` file.

---

### 1. `create_community`
- **Description:** Creates a new community.
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

### 2. `join_community`
- **Description:** A user requests to join a community. Their status is set to `pending`. Can also be used to re-apply if previously rejected/removed.
- **Parameters:** None.
- **Accounts:**
  - `community`: The community being joined.
  - `member`: The new member account to be initialized (or re-initialized).
  - `user`: The user requesting to join (payer and signer).
  - `system_program`: Required for account creation.
- **Event Emitted:** `MemberJoined`

---

### 3. `approve_member`
- **Description:** An admin approves or rejects a pending member.
- **Parameters:** `approve: bool`
- **Accounts:**
  - `community`: The community the member belongs to.
  - `member`: The member account being approved/rejected.
  - `admin`: The community admin (signer).
- **Event Emitted:** `MemberApproved`

---

### 4. `remove_member`
- **Description:** An admin removes an approved member from a community.
- **Parameters:** None.
- **Accounts:**
  - `community`: The community the member belongs to.
  - `member`: The member account being removed.
  - `admin`: The community admin (signer).
- **Event Emitted:** `MemberRemoved`

---

### 5. `dissolve_community`
- **Description:** An admin dissolves a community, preventing further actions.
- **Parameters:** None.
- **Accounts:**
  - `community`: The community being dissolved.
  - `admin`: The community admin (signer).
- **Event Emitted:** `CommunityDissolved`

---

### 6. `create_voting_question`
- **Description:** An approved member creates a new voting question.
- **Parameters:**
  - `question: String`
  - `options: Vec<String>`
  - `deadline: i64`
- **Accounts:**
  - `community`: The community where the question is being created.
  - `member`: The member account of the creator (used for validation).
  - `voting_question`: The new voting question account to be initialized.
  - `creator`: The user creating the question (payer and signer).
  - `system_program`: Required for account creation.
- **Event Emitted:** `VotingQuestionCreated`

---

### 7. `cast_vote`
- **Description:** An approved member casts a vote on a question.
- **Parameters:** `selected_option: u8`
- **Accounts:**
  - `community`: The community the question belongs to.
  - `voting_question`: The question being voted on.
  - `member`: The member account of the voter (used for validation).
  - `vote`: The new vote account to be initialized (PDA).
  - `voter`: The user casting the vote (payer and signer).
  - `system_program`: Required for account creation.
- **Event Emitted:** `VoteCast`

---

### 8. `close_voting_question`
- **Description:** Anyone closes a voting question after its deadline has passed.
- **Parameters:** None.
- **Accounts:**
  - `voting_question`: The question being closed.
  - `closer`: The user closing the question (signer).
- **Event Emitted:** `VotingQuestionClosed`

---

### 9. `update_community_config`
- **Description:** The community admin updates the voting configuration.
- **Parameters:** `config: CommunityConfig`
- **Accounts:**
    - `community`: The community account to be updated.
    - `admin`: The community admin (signer).
- **Event Emitted:** `CommunityConfigUpdated` 