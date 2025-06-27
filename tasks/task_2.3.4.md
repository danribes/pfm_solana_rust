# Task 2.3.4: Tests for Membership Approval & Role Management

---

## Overview
This document describes the test coverage for membership approval and role management logic in the Solana voting program. It outlines the required test cases, current stubs, and recommendations for full implementation.

---

## Test Coverage (Stubbed or To Be Implemented)
- **Membership Approval:**
    - Success: Admin approves a pending member (status transitions to approved).
    - Success: Admin rejects a pending member (status transitions to rejected).
    - Failure: Non-admin attempts to approve/reject (should fail).
    - Failure: Approving/rejecting a non-pending member (should fail).
    - Event emission: `MemberApproved` event is emitted with correct details.
- **Role Management:**
    - Success: Admin promotes a member to admin (role and community admin field update).
    - Success: Admin demotes another admin to member (role update, admin field remains correct).
    - Failure: Non-admin attempts to change roles (should fail).
    - Failure: Attempt to demote self without assigning a new admin (should fail).
    - Failure: Attempt to promote/demote a non-approved member (should fail).
    - Failure: No-op if already the desired role (should fail with error).
    - Event emission: `MemberRoleChanged` event is emitted with correct details.

---

## Rationale
- **Comprehensive tests** ensure correctness and prevent regressions.
- **Edge case coverage** for validation, access control, and event emission.

---

## Next Steps
- Implement the above test cases in `contracts/voting/tests/voting.ts` using Anchor's testing framework and Chai assertions.
- Use mock keypairs and PDAs to simulate admin/member scenarios.
- Assert on both on-chain state and emitted events.

---

## Files Modified
- `contracts/voting/tests/voting.ts` (test stubs) 