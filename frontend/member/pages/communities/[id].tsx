import React from 'react';
import { useRouter } from 'next/router';
import { AppLayout } from '../src/components/Layout';
import { CommunityDetail } from '../src/components/Communities';

const CommunityDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="text-gray-500">Invalid community ID.</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <CommunityDetail communityId={id} />
    </AppLayout>
  );
};

export default CommunityDetailPage;
