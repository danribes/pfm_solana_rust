const { VotingQuestion, Vote } = require('../../models');
const { v4: uuidv4 } = require('uuid');

const sampleVotingQuestions = (communityIds, userIds) => [
  {
    id: uuidv4(),
    on_chain_id: 'VotingQChainAddr00000000000000000000000000000001',
    community_id: communityIds[0],
    title: 'Should we launch a new project?',
    description: 'Vote on launching a new open source project.',
    question_type: 'single_choice',
    options: ['Yes', 'No', 'Abstain'],
    created_by: userIds[0],
    is_active: true,
    allow_anonymous_voting: false,
    require_member_approval: false,
    min_votes_required: 1,
  },
  {
    id: uuidv4(),
    on_chain_id: 'VotingQChainAddr00000000000000000000000000000002',
    community_id: communityIds[1],
    title: 'Pick a mascot animal',
    description: 'Vote for the new mascot.',
    question_type: 'multiple_choice',
    options: ['Crab', 'Octopus', 'Dolphin'],
    created_by: userIds[1],
    is_active: true,
    allow_anonymous_voting: true,
    require_member_approval: false,
    min_votes_required: 1,
  },
];

const sampleVotes = (questionIds, userIds) => [
  {
    id: uuidv4(),
    question_id: questionIds[0],
    user_id: userIds[0],
    selected_options: [0],
    is_anonymous: false,
  },
  {
    id: uuidv4(),
    question_id: questionIds[0],
    user_id: userIds[1],
    selected_options: [1],
    is_anonymous: false,
  },
  {
    id: uuidv4(),
    question_id: questionIds[1],
    user_id: userIds[1],
    selected_options: [2],
    is_anonymous: true,
  },
];

async function seedVoting(communityIds, userIds) {
  const questions = sampleVotingQuestions(communityIds, userIds);
  await VotingQuestion.bulkCreate(questions, { ignoreDuplicates: true });
  const questionIds = questions.map(q => q.id);
  const votes = sampleVotes(questionIds, userIds);
  await Vote.bulkCreate(votes, { ignoreDuplicates: true });
  return { questions, votes };
}

module.exports = seedVoting; 