// Chart Wrapper Component
// Task 4.4.4 - Wrapper component for chart rendering with different chart types

import React from 'react';
import { ChartData, ChartType } from '../../types/results';

interface ChartWrapperProps {
  data: ChartData;
  type: ChartType;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTitle?: boolean;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  data,
  type,
  height = 300,
  className = '',
  showLegend = true,
  showTitle = true
}) => {
  const renderChart = () => {
    if (!data || !data.datasets || data.datasets.length === 0) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    const { labels, datasets, title } = data;
    const dataset = datasets[0];

    switch (type) {
      case 'bar':
        return (
          <div className="space-y-4">
            {labels.map((label, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-20 text-sm font-medium text-gray-700 truncate" title={label}>
                  {label}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{
                      width: `${(dataset.data[index] / Math.max(...dataset.data)) * 100}%`,
                      backgroundColor: Array.isArray(dataset.backgroundColor) 
                        ? dataset.backgroundColor[index] 
                        : dataset.backgroundColor || '#3B82F6'
                    }}
                  >
                    <span className="text-xs text-white font-medium">
                      {dataset.data[index]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'pie':
      case 'doughnut':
        const total = dataset.data.reduce((sum, value) => sum + value, 0);
        return (
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {dataset.data.map((value, index) => {
                  const percentage = (value / total) * 100;
                  const strokeDasharray = `${percentage * 2.51} ${251 - percentage * 2.51}`;
                  const strokeDashoffset = -dataset.data.slice(0, index).reduce((sum, v) => sum + v, 0) * 2.51 / total;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r={type === 'doughnut' ? '30' : '40'}
                      fill="none"
                      stroke={Array.isArray(dataset.backgroundColor) 
                        ? dataset.backgroundColor[index] 
                        : dataset.backgroundColor || '#3B82F6'}
                      strokeWidth={type === 'doughnut' ? '10' : '20'}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              {type === 'doughnut' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">{total}</span>
                </div>
              )}
            </div>
            {showLegend && (
              <div className="space-y-2">
                {labels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: Array.isArray(dataset.backgroundColor) 
                          ? dataset.backgroundColor[index] 
                          : dataset.backgroundColor || '#3B82F6'
                      }}
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {dataset.data[index]} ({((dataset.data[index] / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'line':
      case 'area':
        const maxValue = Math.max(...dataset.data);
        const minValue = Math.min(...dataset.data);
        const range = maxValue - minValue || 1;
        
        return (
          <div className="space-y-4">
            <div className="h-48 bg-gray-50 rounded-lg p-4 relative">
              <svg viewBox="0 0 400 150" className="w-full h-full">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={dataset.borderColor || '#3B82F6'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={dataset.borderColor || '#3B82F6'} stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                {/* Area fill for area charts */}
                {type === 'area' && (
                  <polygon
                    points={`0,150 ${dataset.data.map((value, index) => {
                      const x = (index / (dataset.data.length - 1)) * 400;
                      const y = 150 - ((value - minValue) / range) * 130;
                      return `${x},${y}`;
                    }).join(' ')} 400,150`}
                    fill="url(#areaGradient)"
                  />
                )}
                
                {/* Line */}
                <polyline
                  points={dataset.data.map((value, index) => {
                    const x = (index / (dataset.data.length - 1)) * 400;
                    const y = 150 - ((value - minValue) / range) * 130;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={dataset.borderColor || '#3B82F6'}
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
                
                {/* Data points */}
                {dataset.data.map((value, index) => {
                  const x = (index / (dataset.data.length - 1)) * 400;
                  const y = 150 - ((value - minValue) / range) * 130;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={dataset.borderColor || '#3B82F6'}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-500">
              {labels.map((label, index) => (
                <span key={index} className="truncate max-w-16" title={label}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded">
            <p className="text-gray-500">Chart type not supported: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`} style={{ height }}>
      {showTitle && data?.title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.subtitle && (
            <p className="text-sm text-gray-600">{data.subtitle}</p>
          )}
        </div>
      )}
      
      <div className="h-full">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartWrapper;
