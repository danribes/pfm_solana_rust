import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Link from 'next/link';

interface SubmittedPageProps {
  communityId: string;
  requestId: string;
}

const SubmittedPage: React.FC<SubmittedPageProps> = ({ communityId, requestId }) => {
  const router = useRouter();

  useEffect(() => {
    // Track successful submission
    console.log('Application submitted successfully', { communityId, requestId });
  }, [communityId, requestId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Application Submitted!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your application has been successfully submitted. You will receive email notifications about the status of your application.
        </p>

        {/* Application ID */}
        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Application ID</p>
          <p className="font-mono text-sm text-gray-900">{requestId}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href={`/requests/${requestId}/status`}
            className="w-full inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Track Application Status
          </Link>
          
          <Link
            href="/communities"
            className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Other Communities
          </Link>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Next Steps Information */}
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-xs text-blue-800 space-y-1 text-left">
            <li>• Community admins will review your application</li>
            <li>• You'll receive updates via email and dashboard notifications</li>
            <li>• Review typically takes 3-5 business days</li>
            <li>• You can track progress anytime using the link above</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const { requestId } = context.query;

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  if (!requestId || typeof requestId !== 'string') {
    return {
      redirect: {
        destination: `/communities/${id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      communityId: id,
      requestId,
    },
  };
};

export default SubmittedPage;