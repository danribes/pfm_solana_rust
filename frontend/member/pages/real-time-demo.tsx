import React, { useState, useEffect } from 'react';

interface ChartData {
  title: string;
  subtitle?: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
  }>;
}

const SimpleRealTimeDemo: React.FC = () => {
  const [votingData, setVotingData] = useState<ChartData | null>(null);
  const [participationData, setParticipationData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Generate mock real-time data
  const generateVotingData = (): ChartData => {
    const options = ['Increase Budget', 'New Governance', 'Member Benefits', 'Education'];
    const baseVotes = [45, 38, 32, 28];
    const currentVotes = baseVotes.map(base => base + Math.floor(Math.random() * 20) - 10);

    return {
      title: 'Live Voting Results',
      subtitle: `Last updated: ${new Date().toLocaleTimeString()}`,
      labels: options,
      datasets: [{
        label: 'Votes',
        data: currentVotes,
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#2563EB', '#059669', '#D97706', '#DC2626']
      }]
    };
  };

  const generateParticipationData = (): ChartData => {
    const now = new Date();
    const timeLabels = Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 60000);
      return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    });

    const participationData = timeLabels.map(() => 
      185 + Math.floor(Math.random() * 30) - 15
    );

    return {
      title: 'Participation Trends',
      subtitle: 'Active members over time',
      labels: timeLabels,
      datasets: [{
        label: 'Active Members',
        data: participationData,
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB'
      }]
    };
  };

  // Simple bar chart component
  const BarChart: React.FC<{ data: ChartData; height?: number }> = ({ data, height = 300 }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.subtitle && <p className="text-sm text-gray-600">{data.subtitle}</p>}
        </div>
        <div className="space-y-3">
          {data.labels.map((label, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-32 text-sm font-medium text-gray-700 truncate" title={label}>
                {label}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${(data.datasets[0].data[index] / maxValue) * 100}%`,
                    backgroundColor: Array.isArray(data.datasets[0].backgroundColor) 
                      ? data.datasets[0].backgroundColor[index] 
                      : data.datasets[0].backgroundColor
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {data.datasets[0].data[index]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple line chart component
  const LineChart: React.FC<{ data: ChartData; height?: number }> = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.datasets[0].data);
    const minValue = Math.min(...data.datasets[0].data);
    const range = maxValue - minValue || 1;
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
          {data.subtitle && <p className="text-sm text-gray-600">{data.subtitle}</p>}
        </div>
        <div className="bg-gray-50 rounded-lg p-4" style={{ height }}>
          <svg viewBox="0 0 400 150" className="w-full h-full">
            {/* Line */}
            <polyline
              points={data.datasets[0].data.map((value, index) => {
                const x = (index / (data.datasets[0].data.length - 1)) * 400;
                const y = 150 - ((value - minValue) / range) * 130;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={data.datasets[0].borderColor || '#3B82F6'}
              strokeWidth="2"
              className="transition-all duration-1000"
            />
            
            {/* Data points */}
            {data.datasets[0].data.map((value, index) => {
              const x = (index / (data.datasets[0].data.length - 1)) * 400;
              const y = 150 - ((value - minValue) / range) * 130;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={data.datasets[0].borderColor || '#3B82F6'}
                  className="transition-all duration-1000"
                />
              );
            })}
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500">
          {data.labels.map((label, index) => (
            <span key={index} className="truncate max-w-16" title={label}>
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Real-time data updates
  useEffect(() => {
    const updateData = () => {
      setVotingData(generateVotingData());
      setParticipationData(generateParticipationData());
      setLastUpdate(new Date());
      setIsLoading(false);
    };

    // Initial load
    updateData();

    // Update every 3 seconds
    const interval = setInterval(updateData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Real-Time Results Demo
                </h1>
                <p className="mt-2 text-gray-600">
                  Live voting data visualization (Task 4.5.1)
                </p>
              </div>
              
              {/* Live indicator */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-700 text-sm font-medium">LIVE</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Voting Results */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">Live Voting Results</h2>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="text-xs text-gray-500">Updates every 3s</span>
              </div>
              {votingData && <BarChart data={votingData} height={350} />}
            </div>

            {/* Participation Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900">Participation Trends</h2>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                </div>
                <span className="text-xs text-gray-500">Real-time</span>
              </div>
              {participationData && <LineChart data={participationData} height={250} />}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {votingData ? votingData.datasets[0].data.reduce((a, b) => a + b, 0) : 0}
            </div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {participationData ? participationData.datasets[0].data[participationData.datasets[0].data.length - 1] : 0}
            </div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {Math.floor(Math.random() * 15) + 5}
            </div>
            <div className="text-sm text-gray-600">Votes/Min</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-sm text-gray-600">Active Questions</div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task 4.5.1 Features Implemented</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Real-time data updates (every 3 seconds)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Interactive bar charts for voting results</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Line charts for participation trends</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Smooth animations and transitions</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Live status indicators</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Mobile-optimized responsive design</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Real-time statistics dashboard</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Professional UI with visual feedback</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRealTimeDemo;
