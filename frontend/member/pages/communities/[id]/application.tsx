import React from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import JoinRequestForm from '../../../components/Community/JoinRequestForm';

interface ApplicationPageProps {
  communityId: string;
}

const ApplicationPage: React.FC<ApplicationPageProps> = ({ communityId }) => {
  const router = useRouter();

  const handleSuccess = (requestId: string) => {
    router.push(`/communities/${communityId}/application/submitted?requestId=${requestId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JoinRequestForm
        communityId={communityId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  if (!id || typeof id !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      communityId: id,
    },
  };
};

export default ApplicationPage;