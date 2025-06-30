// Approval Status Component
import React from 'react';

export enum ApprovalStatusType {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

interface ApprovalStatusProps {
  status: ApprovalStatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const ApprovalStatus: React.FC<ApprovalStatusProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = (status: ApprovalStatusType) => {
    const configs = {
      [ApprovalStatusType.PENDING]: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳',
        text: 'Pending'
      },
      [ApprovalStatusType.UNDER_REVIEW]: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '👀',
        text: 'Under Review'
      },
      [ApprovalStatusType.APPROVED]: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        text: 'Approved'
      },
      [ApprovalStatusType.REJECTED]: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌',
        text: 'Rejected'
      },
      [ApprovalStatusType.ESCALATED]: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '⬆️',
        text: 'Escalated'
      },
      [ApprovalStatusType.ON_HOLD]: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '⏸️',
        text: 'On Hold'
      },
      [ApprovalStatusType.CANCELLED]: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🚫',
        text: 'Cancelled'
      },
      [ApprovalStatusType.EXPIRED]: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '⏰',
        text: 'Expired'
      }
    };
    return configs[status];
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses[size]} ${className}`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      <span>{config.text}</span>
    </span>
  );
};
