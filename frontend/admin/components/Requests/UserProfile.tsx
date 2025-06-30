// User Profile Component for Request Management
import React from 'react';
import { UserProfile as UserProfileType, VerificationStatus } from '../../types/request';

interface UserProfileProps {
  userProfile: UserProfileType;
  showWalletHistory?: boolean;
  showDetailedInfo?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userProfile,
  showWalletHistory = true,
  showDetailedInfo = true
}) => {
  const getVerificationBadge = (status: VerificationStatus) => {
    const badges = {
      [VerificationStatus.UNVERIFIED]: { color: 'bg-gray-100 text-gray-800', label: 'Unverified' },
      [VerificationStatus.EMAIL_VERIFIED]: { color: 'bg-blue-100 text-blue-800', label: 'Email Verified' },
      [VerificationStatus.PHONE_VERIFIED]: { color: 'bg-yellow-100 text-yellow-800', label: 'Phone Verified' },
      [VerificationStatus.IDENTITY_VERIFIED]: { color: 'bg-green-100 text-green-800', label: 'ID Verified' },
      [VerificationStatus.FULLY_VERIFIED]: { color: 'bg-green-100 text-green-800', label: 'Fully Verified' }
    };
    
    return badges[status] || badges[VerificationStatus.UNVERIFIED];
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return 'text-green-600';
    if (reputation >= 60) return 'text-yellow-600';
    if (reputation >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const verificationBadge = getVerificationBadge(userProfile.verificationStatus);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Basic Profile Info */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {userProfile.profilePicture ? (
              <img
                src={userProfile.profilePicture}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl font-semibold text-gray-600">
                  {(userProfile.username || userProfile.walletAddress).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {userProfile.username || 'Anonymous User'}
              </h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${verificationBadge.color}`}>
                {verificationBadge.label}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Wallet:</span>
                <span className="font-mono">{formatAddress(userProfile.walletAddress)}</span>
                <button className="text-blue-600 hover:text-blue-800 text-xs">
                  View on Explorer
                </button>
              </div>
              
              {userProfile.email && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Email:</span>
                  <span>{userProfile.email}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Joined:</span>
                <span>{formatDate(userProfile.joinedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reputation and Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Reputation Score</span>
              <span className={`text-lg font-bold ${getReputationColor(userProfile.reputation)}`}>
                {userProfile.reputation}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${userProfile.reputation >= 80 ? 'bg-green-600' : 
                  userProfile.reputation >= 60 ? 'bg-yellow-600' : 
                  userProfile.reputation >= 40 ? 'bg-orange-600' : 'bg-red-600'}`}
                style={{ width: `${userProfile.reputation}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-700 block mb-2">Badges</span>
            <div className="flex flex-wrap gap-1">
              {userProfile.badges.length === 0 ? (
                <span className="text-xs text-gray-500">No badges earned</span>
              ) : (
                userProfile.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {badge}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {userProfile.socialLinks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Social Links</h4>
            <div className="space-y-2">
              {userProfile.socialLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium capitalize">{link.platform}:</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {link.url}
                    </a>
                  </div>
                  {link.verified && (
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Communities */}
        {showDetailedInfo && userProfile.previousCommunities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Previous Communities</h4>
            <div className="space-y-1">
              {userProfile.previousCommunities.map((community, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {community}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet Transaction History */}
        {showWalletHistory && userProfile.walletHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Wallet Activity</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {userProfile.walletHistory.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.status === 'confirmed' ? 'bg-green-500' : 
                        transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <span className="font-medium">{transaction.type}</span>
                        {transaction.amount && (
                          <span className="text-gray-600 ml-2">
                            {transaction.amount} SOL
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </div>
                      <a
                        href={`https://explorer.solana.com/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Indicators */}
        {showDetailedInfo && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Account Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {Math.floor((Date.now() - new Date(userProfile.joinedAt).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-gray-500">Days Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {userProfile.walletHistory.length}
                </div>
                <div className="text-gray-500">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {userProfile.previousCommunities.length}
                </div>
                <div className="text-gray-500">Communities</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
