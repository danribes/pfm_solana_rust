// Progress Tracker Component for Campaign Visualization
import React from 'react';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
  isCurrent?: boolean;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  orientation = 'horizontal',
  size = 'md',
  showDescription = true
}) => {
  const sizeClasses = {
    sm: {
      circle: 'w-6 h-6 text-xs',
      title: 'text-xs',
      description: 'text-xs'
    },
    md: {
      circle: 'w-8 h-8 text-sm',
      title: 'text-sm',
      description: 'text-xs'
    },
    lg: {
      circle: 'w-10 h-10 text-base',
      title: 'text-base',
      description: 'text-sm'
    }
  };

  const getStepStatus = (step: ProgressStep) => {
    if (step.isCompleted) {
      return {
        circle: 'bg-green-500 text-white border-green-500',
        title: 'text-gray-900 font-medium',
        connector: 'bg-green-500'
      };
    } else if (step.isActive || step.isCurrent) {
      return {
        circle: 'bg-blue-500 text-white border-blue-500',
        title: 'text-blue-600 font-medium',
        connector: 'bg-gray-300'
      };
    } else {
      return {
        circle: 'bg-gray-300 text-gray-600 border-gray-300',
        title: 'text-gray-500',
        connector: 'bg-gray-300'
      };
    }
  };

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const status = getStepStatus(step);
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                rounded-full border-2 flex items-center justify-center font-medium
                ${sizeClasses[size].circle} ${status.circle}
              `}>
                {step.isCompleted ? '✓' : index + 1}
              </div>
              
              <div className="text-center mt-2">
                <div className={`font-medium ${sizeClasses[size].title} ${status.title}`}>
                  {step.title}
                </div>
                {showDescription && step.description && (
                  <div className={`mt-1 text-gray-500 ${sizeClasses[size].description} max-w-24 mx-auto`}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-4 ${status.connector}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};
