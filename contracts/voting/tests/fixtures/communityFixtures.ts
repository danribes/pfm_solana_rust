import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";

/**
 * Test Fixtures for Contract Testing
 * Provides deterministic test data for consistent CI/CD testing
 */

export interface CommunityFixture {
  name: string;
  description: string;
  config: {
    votingPeriod: BN;
    maxOptions: number;
  };
  expectedMemberCount: number;
}

export interface MemberFixture {
  keypair: anchor.web3.Keypair;
  role: number; // 0 = member, 1 = admin
  status: number; // 0 = pending, 1 = approved, 2 = rejected
  profile: {
    displayName: string;
    bio: string;
  };
}

export interface VotingQuestionFixture {
  question: string;
  options: string[];
  deadlineOffsetSeconds: number; // Offset from current time
  expectedVotes: number;
}

export interface VoteFixture {
  memberIndex: number; // Index in member fixtures array
  selectedOption: number;
  expectedOutcome: 'success' | 'failure';
  failureReason?: string;
}

// Standard community fixtures for testing
export const COMMUNITY_FIXTURES: CommunityFixture[] = [
  {
    name: "Test Community Alpha",
    description: "A primary test community for comprehensive testing scenarios.",
    config: {
      votingPeriod: new BN(3600), // 1 hour
      maxOptions: 4
    },
    expectedMemberCount: 1 // Admin initially
  },
  {
    name: "Test Community Beta",
    description: "A secondary test community for multi-community scenarios.",
    config: {
      votingPeriod: new BN(7200), // 2 hours
      maxOptions: 6
    },
    expectedMemberCount: 1
  }
];

// Member fixtures with pre-generated keypairs for deterministic testing
export const generateMemberFixtures = (): MemberFixture[] => [
  {
    keypair: anchor.web3.Keypair.fromSecretKey(
      new Uint8Array([174,47,154,16,202,193,206,113,199,190,53,133,169,175,31,56,222,53,138,189,224,216,117,173,10,149,53,45,73,228,112,99,2,137,127,197,58,218,26,206,5,208,221,113,97,34,222,137,135,234,173,142,219,196,51,248,118,42,54,42,152,24,181,252])
    ),
    role: 0, // member
    status: 1, // approved
    profile: {
      displayName: "Alice Member",
      bio: "Active community member and tester"
    }
  },
  {
    keypair: anchor.web3.Keypair.fromSecretKey(
      new Uint8Array([177,9,88,137,174,165,70,121,89,193,129,183,37,154,8,150,22,165,123,84,25,234,141,92,75,5,79,91,44,247,184,139,248,63,245,181,217,172,3,176,156,11,181,239,90,105,78,235,112,209,48,29,108,181,12,4,77,47,0,215,85,18,56,70])
    ),
    role: 0, // member
    status: 1, // approved
    profile: {
      displayName: "Bob Member",
      bio: "Regular community participant"
    }
  }
];

// Voting question fixtures for comprehensive testing
export const VOTING_QUESTION_FIXTURES: VotingQuestionFixture[] = [
  {
    question: "What should be the primary focus for next quarter?",
    options: ["Community Growth", "Technical Development", "Marketing", "Partnerships"],
    deadlineOffsetSeconds: 300, // 5 minutes from creation
    expectedVotes: 2
  },
  {
    question: "Which event format do you prefer?",
    options: ["Online Webinars", "In-Person Meetups", "Hybrid Events"],
    deadlineOffsetSeconds: 600, // 10 minutes from creation
    expectedVotes: 2
  }
];

// Vote fixtures defining expected voting behavior
export const VOTE_FIXTURES: VoteFixture[][] = [
  // Votes for question 0
  [
    { memberIndex: 0, selectedOption: 1, expectedOutcome: 'success' },
    { memberIndex: 1, selectedOption: 2, expectedOutcome: 'success' }
  ],
  // Votes for question 1
  [
    { memberIndex: 0, selectedOption: 0, expectedOutcome: 'success' },
    { memberIndex: 1, selectedOption: 1, expectedOutcome: 'success' }
  ]
];

// Error test fixtures for negative testing
export const ERROR_TEST_FIXTURES = {
  invalidCommunityNames: [
    "", // Empty name
    "a".repeat(100), // Too long name
  ],
  invalidDescriptions: [
    "", // Empty description
    "a".repeat(1000), // Too long description
  ],
  invalidConfigs: [
    { votingPeriod: new BN(-1), maxOptions: 4 }, // Negative voting period
    { votingPeriod: new BN(0), maxOptions: 4 }, // Zero voting period
    { votingPeriod: new BN(3600), maxOptions: 0 }, // Zero options
  ]
};

// Timing utilities for test coordination
export const TIMING = {
  shortDelay: 1000, // 1 second
  mediumDelay: 3000, // 3 seconds
  longDelay: 5000, // 5 seconds
  testTimeout: 60000, // 1 minute
  deadlineBuffer: 2000, // 2 seconds buffer for deadline tests
};

// Helper functions for test setup
export const TestHelpers = {
  /**
   * Generate a future timestamp for voting deadlines
   */
  getFutureTimestamp: (offsetSeconds: number): BN => {
    return new BN(Math.floor(Date.now() / 1000) + offsetSeconds);
  },

  /**
   * Generate a past timestamp for testing expired scenarios
   */
  getPastTimestamp: (offsetSeconds: number): BN => {
    return new BN(Math.floor(Date.now() / 1000) - offsetSeconds);
  },

  /**
   * Wait for a specified number of milliseconds
   */
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate random keypair for dynamic testing
   */
  generateRandomKeypair: (): anchor.web3.Keypair => {
    return anchor.web3.Keypair.generate();
  },

  /**
   * Validate account data against expected fixture
   */
  validateCommunityAccount: (account: any, fixture: CommunityFixture, adminKey: anchor.web3.PublicKey) => {
    return {
      nameMatches: account.name === fixture.name,
      descriptionMatches: account.description === fixture.description,
      adminMatches: account.admin.equals(adminKey),
      votingPeriodMatches: account.config.votingPeriod.eq(fixture.config.votingPeriod),
      maxOptionsMatches: account.config.maxOptions === fixture.config.maxOptions,
    };
  },

  /**
   * Get expected vote tallies for a question
   */
  getExpectedTally: (questionIndex: number): { [option: number]: number } => {
    const votes = VOTE_FIXTURES[questionIndex] || [];
    const tally: { [option: number]: number } = {};
    
    votes.forEach(vote => {
      if (vote.expectedOutcome === 'success') {
        tally[vote.selectedOption] = (tally[vote.selectedOption] || 0) + 1;
      }
    });
    
    return tally;
  }
};

export default {
  COMMUNITY_FIXTURES,
  generateMemberFixtures,
  VOTING_QUESTION_FIXTURES,
  VOTE_FIXTURES,
  ERROR_TEST_FIXTURES,
  TIMING,
  TestHelpers
}; 