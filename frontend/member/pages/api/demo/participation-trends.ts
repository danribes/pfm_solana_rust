import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date();
  const timeLabels = Array.from({ length: 12 }, (_, i) => {
    const time = new Date(now.getTime() - (11 - i) * 5 * 60000);
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  const baseParticipation = 185;
  const participationData = timeLabels.map(() => 
    baseParticipation + Math.floor(Math.random() * 30) - 15
  );

  const data = {
    title: 'Member Participation Trends',
    subtitle: 'Active members over time',
    labels: timeLabels,
    datasets: [{
      label: 'Active Members',
      data: participationData,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      fill: true
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
