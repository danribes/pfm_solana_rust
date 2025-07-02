import React from 'react';
import { GetServerSideProps } from 'next';
import ApplicationStatus from '../../../components/Community/ApplicationStatus';

interface StatusPageProps {
  requestId: string;
}

const StatusPage: React.FC<StatusPageProps> = ({ requestId }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicationStatus
        requestId={requestId}
        showActions={true}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { requestId } = context.params!;

  if (!requestId || typeof requestId !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      requestId,
    },
  };
};

export default StatusPage;