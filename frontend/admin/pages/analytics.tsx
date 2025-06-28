import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout/Layout';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';

const AnalyticsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Analytics & Reporting - PFM Admin</title>
        <meta name="description" content="Analytics dashboard and reporting tools for PFM community management" />
      </Head>
      
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                Analytics & Reporting
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Comprehensive insights, data visualization, and reporting tools for community management
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <AnalyticsDashboard />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AnalyticsPage; 