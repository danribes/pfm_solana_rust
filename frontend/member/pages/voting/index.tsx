import React, { useState } from 'react';

// Simplified voting interface components
const VotingQuestionCard: React.FC<{ question: any }> = ({ question }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-4">
    <h3 className="text-lg font-semibold mb-2">{question.title}</h3>
    <p className="text-gray-600 mb-4">{question.description}</p>
    <div className="space-y-2">
      {question.options.map((option: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <input 
            type="radio" 
            name={`question-${question.id}`}
            id={`option-${question.id}-${index}`}
            className="text-blue-600"
          />
          <label htmlFor={`option-${question.id}-${index}`} className="flex-1">
            {option.text}
          </label>
        </div>
      ))}
    </div>
    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Cast Vote
    </button>
  </div>
);

const VotingPage: React.FC = () => {
  const [mockQuestions] = useState([
    {
      id: '1',
      title: 'Should we implement staking rewards?',
      description: 'Proposal to add staking rewards for community token holders',
      options: [
        { text: 'Yes, implement staking rewards' },
        { text: 'No, keep current system' },
        { text: 'Need more information' }
      ]
    },
    {
      id: '2', 
      title: 'New fee structure proposal',
      description: 'Proposal to reduce platform fees by 50%',
      options: [
        { text: 'Approve fee reduction' },
        { text: 'Reject proposal' },
        { text: 'Propose alternative' }
      ]
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Voting</h1>
            <p className="text-gray-600 mt-2">
              Participate in community governance by voting on active proposals
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Demo Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a demonstration of the voting interface. Connect your wallet to participate in real voting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {mockQuestions.map((question) => (
              <VotingQuestionCard key={question.id} question={question} />
            ))}
          </div>

          {mockQuestions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                No active voting questions found.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingPage; 