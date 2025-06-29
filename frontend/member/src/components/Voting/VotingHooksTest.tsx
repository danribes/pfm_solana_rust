import React from "react";
import { useVoting, useVotingStats } from "../../hooks/useVoting";
import { useVotingHistory } from "../../hooks/useVotingHistory";

const VotingHooksTest: React.FC = () => {
  const { state } = useVoting();
  const { stats } = useVotingStats();
  const { votes } = useVotingHistory();

  return (
    <div>
      <h1>Voting Hooks Test</h1>
      <p>Questions loaded: {state.questions.length}</p>
      <p>User votes: {votes.length}</p>
      <p>Stats available: {stats ? "Yes" : "No"}</p>
      <p>Test completed successfully!</p>
    </div>
  );
};

export default VotingHooksTest;
