// Task 7.1.1: Public Landing Page Development
// Newsletter subscription endpoint

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, firstName, lastName, source, timestamp } = req.body;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email address is required' 
      });
    }

    // Simulate newsletter subscription
    // In production, this would integrate with a service like Mailchimp, ConvertKit, etc.
    console.log('Newsletter subscription:', {
      email,
      firstName,
      lastName,
      source,
      timestamp: timestamp || new Date().toISOString()
    });

    // Simulate processing delay
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: 'Successfully subscribed to newsletter',
        subscriber: {
          email,
          subscribed: true,
          timestamp: new Date().toISOString()
        }
      });
    }, 1000);

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
