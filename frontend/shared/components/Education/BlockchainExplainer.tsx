// Task 7.2.1: User Onboarding Flow & Tutorial System
// Blockchain education component with interactive explanations

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EducationContent, EducationSection, Example, Quiz, QuizQuestion } from '@/types/onboarding';
import { useOnboardingAnalytics } from '@/hooks/useOnboarding';

interface BlockchainExplainerProps {
  onComplete: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  userId: string;
}

// Mock blockchain education content
const blockchainContent: EducationContent = {
  type: 'blockchain',
  title: 'Understanding Blockchain Technology',
  description: 'Learn the fundamentals of blockchain and how it powers our platform',
  sections: [
    {
      id: 'what-is-blockchain',
      title: 'What is Blockchain?',
      content: `Blockchain is a revolutionary technology that acts as a digital ledger - think of it as a special kind of record book that's shared across many computers around the world.

Unlike traditional databases that are stored in one place, blockchain distributes information across a network of computers (called nodes). Each "block" contains a group of transactions, and these blocks are linked together in a "chain" using cryptographic hashes.`,
      illustrations: [
        {
          id: 'blockchain-visual',
          type: 'diagram',
          url: '/images/education/blockchain-diagram.svg',
          caption: 'How blocks are linked together in a chain',
          description: 'Visual representation of blockchain structure'
        }
      ],
      keyPoints: [
        'Decentralized network - no single point of control',
        'Immutable records - transactions cannot be altered',
        'Transparent - all transactions are visible to network participants',
        'Secure - cryptographic protection against tampering',
        'Consensus-driven - network agrees on transaction validity'
      ],
      examples: [
        {
          id: 'banking-example',
          title: 'Traditional Banking vs Blockchain',
          description: 'Compare how transactions work in traditional banking versus blockchain',
          scenario: 'You want to send $100 to a friend',
          outcome: 'Traditional: Bank processes and records transaction. Blockchain: Network validates and records on distributed ledger.',
          learningPoint: 'Blockchain eliminates the need for intermediaries while maintaining security'
        }
      ],
      relatedConcepts: ['cryptography', 'consensus', 'nodes', 'hashing']
    },
    {
      id: 'why-blockchain',
      title: 'Why Blockchain Matters',
      content: `Blockchain technology solves several important problems:

**Trust Without Intermediaries**: Traditional systems require trusted third parties (banks, governments) to verify transactions. Blockchain allows strangers to transact directly with confidence.

**Transparency**: All transactions are recorded on a public ledger that anyone can audit, creating unprecedented transparency.

**Security**: The distributed nature and cryptographic protection make blockchain extremely resistant to hacking and fraud.

**Global Access**: Anyone with internet access can participate, removing geographical and institutional barriers.`,
      illustrations: [
        {
          id: 'trust-diagram',
          type: 'infographic',
          url: '/images/education/trust-comparison.svg',
          caption: 'Traditional trust vs blockchain trust',
          description: 'How blockchain enables trustless transactions'
        }
      ],
      keyPoints: [
        'Eliminates need for trusted intermediaries',
        'Provides verifiable transparency',
        'Reduces fraud and corruption',
        'Enables global financial inclusion',
        'Creates programmable money and contracts'
      ],
      examples: [
        {
          id: 'voting-example',
          title: 'Blockchain Voting',
          description: 'How blockchain can improve voting systems',
          scenario: 'A community needs to vote on a budget proposal',
          outcome: 'Traditional: Paper ballots counted by officials. Blockchain: Digital votes recorded immutably and counted automatically.',
          learningPoint: 'Blockchain voting provides transparency and verifiability while maintaining privacy'
        }
      ],
      relatedConcepts: ['smart contracts', 'decentralization', 'consensus mechanisms']
    },
    {
      id: 'how-it-works',
      title: 'How Blockchain Works',
      content: `Let's break down the blockchain process step by step:

**1. Transaction Initiation**: A user initiates a transaction (like sending cryptocurrency or casting a vote).

**2. Digital Signature**: The transaction is digitally signed using the sender's private key, proving ownership and authenticity.

**3. Broadcasting**: The signed transaction is broadcast to the network of nodes.

**4. Validation**: Network nodes validate the transaction using predetermined rules and cryptographic verification.

**5. Block Creation**: Valid transactions are grouped together into a block by special nodes called miners or validators.

**6. Consensus**: The network uses a consensus mechanism to agree on the new block.

**7. Block Addition**: Once consensus is reached, the new block is added to the chain and distributed across all nodes.

**8. Finalization**: The transaction is now permanently recorded and cannot be altered.`,
      illustrations: [
        {
          id: 'transaction-flow',
          type: 'animation',
          url: '/images/education/transaction-flow.gif',
          caption: 'Step-by-step transaction process',
          description: 'Animated visualization of blockchain transaction flow'
        }
      ],
      keyPoints: [
        'Transactions are digitally signed for authenticity',
        'Network validation ensures only valid transactions proceed',
        'Consensus mechanisms prevent double-spending and fraud',
        'Once recorded, transactions become immutable',
        'The entire network maintains a synchronized copy'
      ],
      examples: [
        {
          id: 'vote-transaction',
          title: 'Casting a Vote on Blockchain',
          description: 'How your vote becomes part of the blockchain',
          scenario: 'You vote "Yes" on a community proposal',
          outcome: 'Your vote is signed with your private key, validated by the network, included in a block, and permanently recorded.',
          learningPoint: 'Blockchain voting ensures your vote is counted correctly and cannot be changed or deleted'
        }
      ],
      relatedConcepts: ['digital signatures', 'consensus mechanisms', 'mining', 'validators']
    }
  ],
  difficulty: 'beginner',
  estimatedReadTime: 15,
  videoUrl: '/videos/blockchain-basics.mp4',
  interactiveDemo: {
    id: 'blockchain-demo',
    title: 'Build a Simple Blockchain',
    type: 'simulation',
    steps: [
      {
        id: 'create-genesis',
        title: 'Create Genesis Block',
        instruction: 'Click to create the first block in our blockchain',
        action: {
          type: 'click',
          target: '#create-genesis-btn',
          expectedValue: 'genesis-created'
        },
        hints: ['The genesis block is the first block in any blockchain'],
        skipAllowed: false
      }
    ],
    canSkip: true,
    trackProgress: true
  }
};

const blockchainQuiz: Quiz = {
  id: 'blockchain-basics-quiz',
  title: 'Blockchain Basics Quiz',
  description: 'Test your understanding of blockchain fundamentals',
  questions: [
    {
      id: 'q1',
      question: 'What makes blockchain transactions immutable?',
      type: 'multiple_choice',
      options: [
        { id: 'a', text: 'They are stored on multiple computers', isCorrect: false },
        { id: 'b', text: 'They are cryptographically linked and require network consensus to change', isCorrect: true },
        { id: 'c', text: 'They are encrypted with strong passwords', isCorrect: false },
        { id: 'd', text: 'They are backed up regularly', isCorrect: false }
      ],
      correctAnswer: 'b',
      explanation: 'Blockchain transactions are immutable because they are cryptographically linked in blocks and any change would require consensus from the majority of the network, which is computationally infeasible.',
      difficulty: 'medium',
      points: 10
    },
    {
      id: 'q2',
      question: 'True or False: Blockchain eliminates the need for trust between parties.',
      type: 'true_false',
      options: [
        { id: 'true', text: 'True', isCorrect: true },
        { id: 'false', text: 'False', isCorrect: false }
      ],
      correctAnswer: 'true',
      explanation: 'Blockchain creates "trustless" systems where parties can transact without needing to trust each other or a third party, because the system itself ensures transaction validity through cryptography and consensus.',
      difficulty: 'easy',
      points: 5
    },
    {
      id: 'q3',
      question: 'Which of the following are key benefits of blockchain technology?',
      type: 'multiple_choice',
      options: [
        { id: 'a', text: 'Transparency and immutability', isCorrect: false },
        { id: 'b', text: 'Decentralization and security', isCorrect: false },
        { id: 'c', text: 'Global access and programmability', isCorrect: false },
        { id: 'd', text: 'All of the above', isCorrect: true }
      ],
      correctAnswer: 'd',
      explanation: 'Blockchain technology provides all these benefits: transparency through public ledgers, immutability through cryptographic linking, decentralization through distributed networks, security through consensus mechanisms, global access without geographical barriers, and programmability through smart contracts.',
      difficulty: 'easy',
      points: 5
    }
  ],
  passingScore: 70,
  allowRetry: true,
  showExplanations: true
};

const BlockchainExplainer: React.FC<BlockchainExplainerProps> = ({
  onComplete,
  onSkip,
  onBack,
  showProgress = true,
  allowSkip = true,
  userId
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [questionId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const { trackEvent, trackFormInteraction } = useOnboardingAnalytics();

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track section completion
  const completeSection = useCallback((sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
      trackEvent('step_complete', 'blockchain-education', {
        section: sectionId,
        timeSpent: readingTime
      });
    }
  }, [completedSections, readingTime, trackEvent]);

  // Handle section navigation
  const goToNextSection = () => {
    const currentSectionData = blockchainContent.sections[currentSection];
    completeSection(currentSectionData.id);

    if (currentSection < blockchainContent.sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  // Handle quiz
  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
    trackFormInteraction(questionId, 'change', answer);
  };

  const submitQuiz = () => {
    let score = 0;
    let totalPoints = 0;

    blockchainQuiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = quizAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        score += question.points;
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);

    trackEvent('quiz_attempt', 'blockchain-education', {
      quizId: blockchainQuiz.id,
      score: percentage,
      passed: percentage >= blockchainQuiz.passingScore,
      answers: quizAnswers
    });

    if (percentage >= blockchainQuiz.passingScore) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  // Interactive demo handlers
  const startDemo = () => {
    setShowDemo(true);
    trackEvent('step_start', 'blockchain-education', {
      action: 'demo_started'
    });
  };

  const nextDemoStep = () => {
    if (demoStep < (blockchainContent.interactiveDemo?.steps.length || 0) - 1) {
      setDemoStep(prev => prev + 1);
    } else {
      setShowDemo(false);
      setShowQuiz(true);
    }
  };

  // Calculate progress
  const totalSections = blockchainContent.sections.length;
  const progress = showQuiz ? 100 : Math.round(((currentSection + 1) / totalSections) * 80); // 80% for content, 20% for quiz

  const currentSectionData = blockchainContent.sections[currentSection];

  // Render quiz
  if (showQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {showProgress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Knowledge Check</span>
              <span className="text-sm font-medium text-gray-700">Quiz</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{blockchainQuiz.title}</h2>
            <p className="text-gray-600">{blockchainQuiz.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Passing score: {blockchainQuiz.passingScore}% • Time spent: {Math.floor(readingTime / 60)}m {readingTime % 60}s
            </p>
          </div>

          {!quizSubmitted ? (
            <div className="space-y-8">
              {blockchainQuiz.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{question.question}</h3>
                      <div className="space-y-2">
                        {question.options?.map(option => (
                          <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={question.id}
                              value={option.id}
                              checked={quizAnswers[question.id] === option.id}
                              onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{option.text}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between">
                <button
                  onClick={() => setShowQuiz(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to Content
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < blockchainQuiz.questions.length}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                quizScore !== null && quizScore >= blockchainQuiz.passingScore 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                <span className="text-3xl font-bold">{quizScore}%</span>
              </div>
              
              <h3 className="text-xl font-bold mb-2">
                {quizScore !== null && quizScore >= blockchainQuiz.passingScore ? 'Congratulations!' : 'Try Again'}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {quizScore !== null && quizScore >= blockchainQuiz.passingScore 
                  ? 'You\'ve successfully completed the blockchain basics quiz. You\'ll be redirected to the next step shortly.'
                  : `You scored ${quizScore}%. You need ${blockchainQuiz.passingScore}% to pass. Review the content and try again.`
                }
              </p>

              {blockchainQuiz.showExplanations && (
                <div className="text-left space-y-4 mb-6">
                  {blockchainQuiz.questions.map((question, index) => {
                    const userAnswer = quizAnswers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div key={question.id} className={`border rounded-lg p-4 ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start space-x-2 mb-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <span className="font-medium">Question {index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{question.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {quizScore !== null && quizScore < blockchainQuiz.passingScore && (
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizScore(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main content view
  return (
    <div className="max-w-4xl mx-auto p-6">
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Blockchain Education</span>
            <span className="text-sm font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Section header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-blue-600 font-medium">
              Section {currentSection + 1} of {totalSections}
            </span>
            <span className="text-sm text-gray-500">
              ⏱️ {Math.floor(readingTime / 60)}m {readingTime % 60}s
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentSectionData.title}</h1>
        </div>

        {/* Section content */}
        <div className="prose prose-lg max-w-none mb-8">
          {currentSectionData.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700 leading-relaxed">
              {paragraph.split('**').map((text, i) => 
                i % 2 === 1 ? <strong key={i}>{text}</strong> : text
              )}
            </p>
          ))}
        </div>

        {/* Key points */}
        {currentSectionData.keyPoints.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Points</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <ul className="space-y-2">
                {currentSectionData.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-blue-900">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Examples */}
        {currentSectionData.examples.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-World Example</h3>
            {currentSectionData.examples.map(example => (
              <div key={example.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{example.title}</h4>
                <p className="text-gray-700 mb-3">{example.description}</p>
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Scenario:</span>
                    <p className="text-sm text-gray-700">{example.scenario}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Outcome:</span>
                    <p className="text-sm text-gray-700">{example.outcome}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded p-3">
                  <span className="text-sm font-medium text-blue-600">💡 Learning Point:</span>
                  <p className="text-sm text-gray-700 mt-1">{example.learningPoint}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interactive demo button */}
        {currentSection === 0 && blockchainContent.interactiveDemo && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Try Interactive Demo</h3>
              <p className="text-gray-600 mb-4">Build a simple blockchain to see how it works!</p>
              <button
                onClick={startDemo}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Start Interactive Demo
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {onBack && currentSection === 0 && (
              <button
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ← Back
              </button>
            )}
            {currentSection > 0 && (
              <button
                onClick={goToPreviousSection}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {allowSkip && onSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip Education
              </button>
            )}
            <button
              onClick={goToNextSection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentSection < totalSections - 1 ? 'Next Section →' : 'Take Quiz →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainExplainer; 