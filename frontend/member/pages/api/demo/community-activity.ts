import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const now = new Date();
  const timeLabels = Array.from({ length: 15 }, (_, i) => {
    const time = new Date(now.getTime() - (14 - i) * 60000);
    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  const activityData = timeLabels.map(() => 
    Math.floor(Math.random() * 20) + 5
  );

  const data = {
    title: 'Live Community Activity',
    subtitle: 'Actions per minute',
    labels: timeLabels,
    datasets: [{
      label: 'Actions/Min',
      data: activityData,
      backgroundColor: '#10B981',
      borderColor: '#059669',
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
