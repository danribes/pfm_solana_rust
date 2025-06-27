# Task 2.1.2: Core Membership Handlers

---

## Overview
This document details the implementation of the core instruction handlers related to community and member management: `create_community`, `join_community`, and `approve_member`.

---

## Steps Taken
1.  **Implemented `create_community` handler:**
    *   Takes `name`, `description`, and `config` as input.
    *   Performs validation to ensure `name` is not empty (max 50 chars) and `description` is not empty (max 200 chars).
    *   Initializes the `Community` account with the provided data and sets the creator as the `admin`.
    *   Sets `member_count` to 1 (for the admin).
2.  **Implemented `join_community` handler:**
    *   Allows a new user to request to join a community.
    *   Initializes a `Member` account, linking it to the community and the user's wallet.
    *   Sets the initial member `status` to `Pending` (0).
3.  **Implemented `approve_member` handler:**
    *   Allows the community `admin` to approve or reject a pending member request.
    *   Requires a boolean `approve` parameter.
    *   If `true`, sets the member `status` to `Approved` (1) and increments the community `member_count`.
    *   If `false`, sets the member `status` to `Rejected` (2).
    *   Includes checks to ensure the signer is the actual community admin.

---

## Rationale
-   **Clear Separation of Concerns:** These handlers manage the fundamental lifecycle of communities and the membership application process.
-   **Validation and Security:** Input validation prevents invalid data on-chain, and access control on `approve_member` ensures only the admin can manage membership.
-   **State Management:** The use of a `status` field in the `Member` account provides a clear and efficient way to track a member's state (pending, approved, rejected).

---

## Files Modified
-   `contracts/voting/programs/voting/src/lib.rs` 