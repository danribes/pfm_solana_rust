# Solana Voting Smart Contract Testing

## Overview

This directory contains the Solana smart contract for the Personal Finance Management (PFM) community voting system, including comprehensive test suites and CI/CD integration.

## Quick Start

### Testing Commands

```bash
# Enter the voting contract directory
cd contracts/voting

# Run all tests (recommended)
anchor test

# Run enhanced CI/CD optimized tests
npm run test:enhanced

# Run original comprehensive tests
npm run test:original

# Run tests with coverage
npm run test:coverage
```

### CI/CD Integration

The contract testing is fully automated through:
- **GitHub Actions:** `.github/workflows/ci-contracts.yml`
- **Test Organization:** Multiple test suites for different purposes
- **Fixtures:** Deterministic test data for consistent results
- **Security Analysis:** Automated security linting and vulnerability scanning

## Test Structure

### 1. Original Test Suite (`tests/voting.ts`)
- Comprehensive end-to-end testing
- Full feature coverage
- ~6 test scenarios covering all contract functionality

### 2. Enhanced Test Suite (`tests/enhanced-voting.ts`)  
- CI/CD optimized for fast feedback
- Core functionality validation
- Environment setup verification

### 3. Test Fixtures (`tests/fixtures/`)
- Deterministic test data
- Pre-generated keypairs for consistency
- Error test cases for negative testing

## CI/CD Features

✅ **Automated Testing:** Tests run on every push/PR
✅ **Build Validation:** Contract compilation verification  
✅ **Security Analysis:** Clippy lints and vulnerability scanning
✅ **Test Reporting:** JSON output and coverage reports
✅ **Artifact Management:** Build artifacts and test results storage
✅ **Environment Isolation:** Clean test environment for each run

## Docker Integration

The contract testing works seamlessly with the containerized environment:

```bash
# All containers healthy and ready for testing
docker-compose ps

# Tests run within the Solana blockchain container context
# Proper network isolation and service discovery
```

## Test Coverage Areas

- ✅ **Community Management:** Creation, configuration, admin operations
- ✅ **Membership Workflows:** Join requests, approvals, role management  
- ✅ **Voting Questions:** Creation, validation, deadline management
- ✅ **Vote Casting:** Member voting, validation, duplicate prevention
- ✅ **Result Aggregation:** Vote counting, result calculation
- ✅ **Error Handling:** Invalid inputs, unauthorized access, edge cases
- ✅ **Security Validation:** Access control, data integrity, state consistency

## Performance & Quality Metrics

- **Test Execution Time:** < 60 seconds for full suite
- **Coverage Target:** 80%+ lines, 80%+ functions
- **CI Pipeline Duration:** < 10 minutes end-to-end
- **Failure Rate:** < 1% for non-breaking changes

## Support & Troubleshooting

For testing issues:
1. Verify all containers are healthy: `docker-compose ps`
2. Check Solana connection: `solana cluster-version`
3. Review CI logs in GitHub Actions
4. Run tests locally with verbose output: `DEBUG=* anchor test`

