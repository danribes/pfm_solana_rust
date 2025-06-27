import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { assert } from "chai";

describe("voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Voting as Program<Voting>;

  // Keypairs and PDAs
  const admin = provider.wallet;
  const member1 = anchor.web3.Keypair.generate();
  const community = anchor.web3.Keypair.generate();

  it("Creates a community", async () => {
    const name = "Test Community";
    const description = "A community for testing.";
    const config = {
      votingPeriod: new anchor.BN(3600), // 1 hour
      maxOptions: 4,
    };

    await program.methods
      .createCommunity(name, description, config)
      .accounts({
        community: community.publicKey,
        admin: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([community])
      .rpc();

    const communityAccount = await program.account.community.fetch(
      community.publicKey
    );

    assert.equal(communityAccount.name, name);
    assert.equal(communityAccount.description, description);
    assert.ok(communityAccount.admin.equals(admin.publicKey));
    assert.equal(communityAccount.memberCount, 1); // Admin is the first member
  });

  it("Member requests to join (pending)", async () => {
    const [memberPda, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("member"),
        community.publicKey.toBuffer(),
        member1.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .joinCommunity()
      .accounts({
        community: community.publicKey,
        member: memberPda,
        user: member1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([member1])
      .rpc();

    const memberAccount = await program.account.member.fetch(memberPda);
    assert.ok(memberAccount.community.equals(community.publicKey));
    assert.ok(memberAccount.wallet.equals(member1.publicKey));
    assert.equal(memberAccount.status, 0); // 0 = Pending
  });

  it("Admin approves member", async () => {
    const [memberPda, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("member"),
        community.publicKey.toBuffer(),
        member1.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .approveMember(true) // true for approve
      .accounts({
        community: community.publicKey,
        member: memberPda,
        admin: admin.publicKey,
      })
      .rpc();

    const memberAccount = await program.account.member.fetch(memberPda);
    assert.equal(memberAccount.status, 1); // 1 = Approved

    const communityAccount = await program.account.community.fetch(
      community.publicKey
    );
    assert.equal(communityAccount.memberCount, 2); // Admin + new member
  });

  it("Approved member creates a voting question", async () => {
    const question = "What is your favorite color?";
    const options = ["Red", "Green", "Blue"];
    const deadline = new anchor.BN(Date.now() / 1000 + 3); // 3 seconds from now

    const [questionPda, _] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("question"),
            community.publicKey.toBuffer(),
            member1.publicKey.toBuffer(),
            deadline.toBuffer("le", 8),
        ],
        program.programId
    );


    await program.methods
      .createVotingQuestion(question, options, deadline)
      .accounts({
        votingQuestion: questionPda,
        community: community.publicKey,
        creator: member1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([member1])
      .rpc();

    const questionAccount = await program.account.votingQuestion.fetch(
      questionPda
    );
    assert.equal(questionAccount.question, question);
    assert.deepEqual(questionAccount.options, options);
    assert.ok(questionAccount.creator.equals(member1.publicKey));
  });

  it("Approved member casts a vote", async () => {
    // We need to re-fetch the question PDA since it depends on a timestamp
    // A better approach in a real test suite would be to use a fixed clock
    const questionAccounts = await program.account.votingQuestion.all([
        { memcmp: { offset: 8, bytes: community.publicKey.toBase58() } },
        { memcmp: { offset: 40, bytes: member1.publicKey.toBase58() } }
    ]);
    const questionPda = questionAccounts[0].publicKey;

    const [votePda, _] = await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("vote"),
            questionPda.toBuffer(),
            member1.publicKey.toBuffer(),
        ],
        program.programId
    );

    const selectedOption = 1; // "Green"

    await program.methods
        .castVote(selectedOption)
        .accounts({
            votingQuestion: questionPda,
            vote: votePda,
            voter: member1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([member1])
        .rpc();

    const voteAccount = await program.account.vote.fetch(votePda);
    assert.ok(voteAccount.question.equals(questionPda));
    assert.ok(voteAccount.voter.equals(member1.publicKey));
    assert.equal(voteAccount.selectedOption, selectedOption);
  });

  it("Anyone can close voting question after deadline", async () => {
    // Wait for the deadline to pass
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const questionAccounts = await program.account.votingQuestion.all([
        { memcmp: { offset: 8, bytes: community.publicKey.toBase58() } },
        { memcmp: { offset: 40, bytes: member1.publicKey.toBase58() } }
    ]);
    const questionPda = questionAccounts[0].publicKey;

    await program.methods
        .closeVotingQuestion()
        .accounts({
            votingQuestion: questionPda,
            closer: admin.publicKey,
        })
        .rpc();
        
    const questionAccount = await program.account.votingQuestion.fetch(questionPda);
    assert.equal(questionAccount.isActive, false);
  });
}); 