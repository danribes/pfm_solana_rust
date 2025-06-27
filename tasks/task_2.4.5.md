# Task 2.4.5: Tests for Voting Question Creation

---

## Overview
This document describes the test coverage for voting question creation logic in the Solana voting program. It outlines the required test cases, current stubs, and recommendations for full implementation.

---

## Test Coverage (Stubbed or To Be Implemented)
- **Successful Question Creation:**
    - Approved member creates a question with valid inputs (2-4 options, future deadline).
    - Event emission (`VotingQuestionCreated`) with correct details.
    - Account initialization with proper data.
- **Validation Tests:**
    - Failure on question text too long (>256 chars).
    - Failure on too few options (<2).
    - Failure on too many options (>4).
    - Failure on past deadline.
    - Failure on non-approved member attempting to create.
    - Failure in dissolved community.
- **Access Control Tests:**
    - Only approved members can create questions.
    - Pending/rejected/removed members cannot create questions.
    - Questions cannot be created in dissolved communities.
- **Edge Cases:**
    - Question with exactly 2 options (minimum).
    - Question with exactly 4 options (maximum).
    - Deadline set to current time (should fail).
    - Empty question text (should fail).

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
- Test integration with community configuration settings.

---

## Files Modified
- `contracts/voting/tests/voting.ts` (test stubs) 