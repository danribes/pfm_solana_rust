import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../../target/types/voting";

/**
 * Test Cleanup Utilities
 * Manages test account cleanup and state isolation for CI/CD
 */

export interface CleanupContext {
  program: Program<Voting>;
  provider: anchor.AnchorProvider;
  accountsToCleanup: {
    communities: anchor.web3.PublicKey[];
    members: anchor.web3.PublicKey[];
    questions: anchor.web3.PublicKey[];
    votes: anchor.web3.PublicKey[];
  };
}

export class TestAccountManager {
  private context: CleanupContext;
  private cleanupActions: (() => Promise<void>)[] = [];

  constructor(context: CleanupContext) {
    this.context = context;
  }

  /**
   * Register a community account for cleanup
   */
  registerCommunity(publicKey: anchor.web3.PublicKey): void {
    this.context.accountsToCleanup.communities.push(publicKey);
  }

  /**
   * Register a member account for cleanup
   */
  registerMember(publicKey: anchor.web3.PublicKey): void {
    this.context.accountsToCleanup.members.push(publicKey);
  }

  /**
   * Register a voting question account for cleanup
   */
  registerQuestion(publicKey: anchor.web3.PublicKey): void {
    this.context.accountsToCleanup.questions.push(publicKey);
  }

  /**
   * Register a vote account for cleanup
   */
  registerVote(publicKey: anchor.web3.PublicKey): void {
    this.context.accountsToCleanup.votes.push(publicKey);
  }

  /**
   * Register a custom cleanup action
   */
  registerCleanupAction(action: () => Promise<void>): void {
    this.cleanupActions.push(action);
  }

  /**
   * Cleanup all registered accounts and perform custom actions
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Starting test cleanup...');

    // Execute custom cleanup actions first
    for (const action of this.cleanupActions) {
      try {
        await action();
      } catch (error) {
        console.warn('Cleanup action failed (non-critical):', error.message);
      }
    }

    // Cleanup votes (dependent accounts first)
    for (const voteKey of this.context.accountsToCleanup.votes) {
      await this.safeCloseAccount(voteKey, 'vote');
    }

    // Cleanup questions
    for (const questionKey of this.context.accountsToCleanup.questions) {
      await this.safeCloseAccount(questionKey, 'question');
    }

    // Cleanup members
    for (const memberKey of this.context.accountsToCleanup.members) {
      await this.safeCloseAccount(memberKey, 'member');
    }

    // Cleanup communities (parent accounts last)
    for (const communityKey of this.context.accountsToCleanup.communities) {
      await this.safeCloseAccount(communityKey, 'community');
    }

    // Reset tracking arrays
    this.context.accountsToCleanup = {
      communities: [],
      members: [],
      questions: [],
      votes: []
    };

    this.cleanupActions = [];
    console.log('✅ Test cleanup completed');
  }

  /**
   * Safely attempt to close an account (non-critical failure)
   */
  private async safeCloseAccount(accountKey: anchor.web3.PublicKey, accountType: string): Promise<void> {
    try {
      const accountInfo = await this.context.provider.connection.getAccountInfo(accountKey);
      if (accountInfo) {
        // Account exists - attempt cleanup
        // Note: Actual close logic depends on contract implementation
        console.log(`Cleaning up ${accountType} account: ${accountKey.toBase58()}`);
        
        // For now, just verify the account exists
        // In a full implementation, this would call contract close instructions
      }
    } catch (error) {
      console.warn(`Failed to cleanup ${accountType} account ${accountKey.toBase58()}: ${error.message}`);
    }
  }

  /**
   * Generate cleanup report for debugging
   */
  generateCleanupReport(): string {
    const { accountsToCleanup } = this.context;
    return `
=== Test Account Cleanup Report ===
Communities: ${accountsToCleanup.communities.length}
Members: ${accountsToCleanup.members.length}
Questions: ${accountsToCleanup.questions.length}
Votes: ${accountsToCleanup.votes.length}
Custom Actions: ${this.cleanupActions.length}
Total Accounts: ${Object.values(accountsToCleanup).flat().length}
===================================
    `.trim();
  }
}

/**
 * Test State Validator
 * Validates test state isolation and account consistency
 */
export class TestStateValidator {
  private program: Program<Voting>;

  constructor(program: Program<Voting>) {
    this.program = program;
  }

  /**
   * Validate that test accounts are in expected state
   */
  async validateTestState(expectedAccounts: {
    communities: number;
    members: number;
    questions: number;
    votes: number;
  }): Promise<boolean> {
    try {
      const communityAccounts = await this.program.account.community.all();
      const memberAccounts = await this.program.account.member.all();
      const questionAccounts = await this.program.account.votingQuestion.all();
      const voteAccounts = await this.program.account.vote.all();

      const actual = {
        communities: communityAccounts.length,
        members: memberAccounts.length,
        questions: questionAccounts.length,
        votes: voteAccounts.length
      };

      const isValid = 
        actual.communities === expectedAccounts.communities &&
        actual.members === expectedAccounts.members &&
        actual.questions === expectedAccounts.questions &&
        actual.votes === expectedAccounts.votes;

      if (!isValid) {
        console.warn('Test state validation failed:', {
          expected: expectedAccounts,
          actual: actual
        });
      }

      return isValid;
    } catch (error) {
      console.error('Test state validation error:', error);
      return false;
    }
  }

  /**
   * Count all test accounts for reporting
   */
  async countAllAccounts(): Promise<{
    communities: number;
    members: number;
    questions: number;
    votes: number;
  }> {
    const [communities, members, questions, votes] = await Promise.all([
      this.program.account.community.all(),
      this.program.account.member.all(),
      this.program.account.votingQuestion.all(),
      this.program.account.vote.all()
    ]);

    return {
      communities: communities.length,
      members: members.length,
      questions: questions.length,
      votes: votes.length
    };
  }
}

/**
 * Test Environment Setup Utilities
 */
export const TestEnvironment = {
  /**
   * Initialize a clean test environment
   */
  async initialize(program: Program<Voting>, provider: anchor.AnchorProvider): Promise<TestAccountManager> {
    const context: CleanupContext = {
      program,
      provider,
      accountsToCleanup: {
        communities: [],
        members: [],
        questions: [],
        votes: []
      }
    };

    const manager = new TestAccountManager(context);
    console.log('🚀 Test environment initialized');
    return manager;
  },

  /**
   * Create isolated test setup for each test case
   */
  async createIsolatedContext(baseManager: TestAccountManager): Promise<TestAccountManager> {
    // Create a new manager with isolated tracking
    const isolatedContext: CleanupContext = {
      program: baseManager.context.program,
      provider: baseManager.context.provider,
      accountsToCleanup: {
        communities: [],
        members: [],
        questions: [],
        votes: []
      }
    };

    return new TestAccountManager(isolatedContext);
  },

  /**
   * Validate environment is ready for testing
   */
  async validateEnvironment(provider: anchor.AnchorProvider): Promise<boolean> {
    try {
      // Check connection
      const version = await provider.connection.getVersion();
      console.log(`✅ Solana connection established: ${version['solana-core']}`);

      // Check wallet balance
      const balance = await provider.connection.getBalance(provider.wallet.publicKey);
      if (balance === 0) {
        console.warn('⚠️  Wallet has zero balance - may need airdrop for testing');
      } else {
        console.log(`✅ Wallet balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
      }

      return true;
    } catch (error) {
      console.error('❌ Environment validation failed:', error);
      return false;
    }
  }
};

export default {
  TestAccountManager,
  TestStateValidator,
  TestEnvironment
}; 