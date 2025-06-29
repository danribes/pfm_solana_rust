import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Generate realistic voting data
  const votingOptions = [
    'Increase Community Fund Budget',
    'Implement New Governance Model', 
    'Expand Member Benefits Program',
    'Launch Education Initiative'
  ];

  const baseVotes = [45, 38, 32, 28];
  const currentVotes = baseVotes.map(base => 
    base + Math.floor(Math.random() * 20) - 10
  );

  const data = {
    title: 'Live Voting Results - Budget Proposal 2025',
    subtitle: `Last updated: ${new Date().toLocaleTimeString()}`,
    labels: votingOptions,
    datasets: [{
      label: 'Votes',
      data: currentVotes,
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      borderColor: ['#2563EB', '#059669', '#D97706', '#DC2626'],
      borderWidth: 2
    }]
  };

  // Add CORS headers for demo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json(data);
}
