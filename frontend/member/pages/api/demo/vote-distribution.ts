import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const options = ['Yes', 'No', 'Abstain'];
  const totalVotes = 143;
  const distribution = [
    Math.floor(totalVotes * (0.55 + Math.random() * 0.15)),
    Math.floor(totalVotes * (0.30 + Math.random() * 0.15)),
    Math.floor(totalVotes * (0.15 + Math.random() * 0.10))
  ];

  const data = {
    title: 'Vote Distribution',
    subtitle: `Total votes: ${distribution.reduce((a, b) => a + b, 0)}`,
    labels: options,
    datasets: [{
      label: 'Votes',
      data: distribution,
      backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
      borderColor: ['#059669', '#DC2626', '#4B5563'],
      borderWidth: 2
    }]
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json(data);
}
