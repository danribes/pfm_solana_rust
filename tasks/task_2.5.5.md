# Task 2.5.5: Tests for Vote Casting

---

## Overview
This document describes the test coverage for vote casting logic in the Solana voting program. It outlines the required test cases, current stubs, and recommendations for full implementation.

---

## Test Coverage (Stubbed or To Be Implemented)
- **Successful Vote Casting:**
    - Approved member casts a vote with valid option and before deadline.
    - Event emission (`VoteCast`) with correct details.
    - Account initialization with proper data.
- **Validation Tests:**
    - Failure on invalid option index (out of range).
    - Failure on voting after deadline.
    - Failure on voting on inactive (closed) question.
    - Failure on non-approved member attempting to vote.
    - Failure in dissolved community.
    - Failure on duplicate vote attempt (PDA already exists).
- **Access Control Tests:**
    - Only approved members can vote.
    - Pending/rejected/removed members cannot vote.
    - Voting cannot occur in dissolved communities.
- **Edge Cases:**
    - Vote with option index 0 (minimum).
    - Vote with option index at maximum (options.length-1).
    - Deadline set to current time (should fail).
    - Voting immediately after question creation (should succeed if before deadline).

---

## Rationale
- **Comprehensive tests** ensure correctness and prevent regressions.
- **Edge case coverage** for validation, access control, and event emission.
- **Test-driven development** provides confidence in the implementation.

---

## Next Steps
- Implement the above test cases in `contracts/voting/tests/voting.ts` using Anchor's testing framework and Chai assertions.
- Use mock keypairs and PDAs to simulate member scenarios.
- Assert on both on-chain state and emitted events.
- Test integration with question and community configuration settings.

---

## Files Modified
- `contracts/voting/tests/voting.ts` (test stubs) 