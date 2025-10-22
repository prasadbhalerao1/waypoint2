import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, AlertTriangle, Calendar, Download } from 'lucide-react';

interface AdminStats {
  dau: number;
  weeklyScreenings: number;
  flaggedPercentage: number;
  avgStreak: number;
  meanMood: number;
}

const Admin: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    dau: 0,
    weeklyScreenings: 0,
    flaggedPercentage: 0,
    avgStreak: 0,
    meanMood: 0
  });

  const [alerts] = useState([
    {
      id: 1,
      type: 'high',
      message: 'Increased anxiety reports in Computer Science department (15% above baseline)',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'medium',
      message: 'Low engagement in wellness exercises this week',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'info',
      message: 'New peer support group formed for final year students',
      timestamp: '2 days ago'
    }
  ]);

  useEffect(() => {
    // Simulate loading admin stats
    const timer = setTimeout(() => {
      setStats({
        dau: 1247,
        weeklyScreenings: 89,
        flaggedPercentage: 12.3,
        avgStreak: 4.2,
        meanMood: 3.4
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = 
    ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const AlertCard: React.FC<{ alert: typeof alerts[0] }> = ({ alert }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      alert.type === 'high' ? 'border-red-500 bg-red-50' :
      alert.type === 'medium' ? 'border-yellow-500 bg-yellow-50' :
      'border-blue-500 bg-blue-50'
    }`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
          alert.type === 'high' ? 'text-red-500' :
          alert.type === 'medium' ? 'text-yellow-500' :
          'text-blue-500'
        }`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Mental health insights and analytics for your institution</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Daily Active Users"
            value={stats.dau.toLocaleString()}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Weekly Screenings"
            value={stats.weeklyScreenings.toString()}
            icon={<BarChart3 className="w-6 h-6 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="Flagged Cases"
            value={`${stats.flaggedPercentage}%`}
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            color="bg-red-100"
          />
          <StatCard
            title="Avg Streak"
            value={`${stats.avgStreak} days`}
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            color="bg-purple-100"
          />
          <StatCard
            title="Mean Mood"
            value={`${stats.meanMood}/5`}
            icon={<TrendingUp className="w-6 h-6 text-indigo-600" />}
            color="bg-indigo-100"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mood Trends Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Trends (7 Days)</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would appear here</p>
                  <p className="text-sm text-gray-400">Showing anonymized mood data trends</p>
                </div>
              </div>
            </div>

            {/* Department Heatmap */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Stress Levels by Department</h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { dept: 'Computer Science', level: 'high' },
                  { dept: 'Engineering', level: 'medium' },
                  { dept: 'Business', level: 'low' },
                  { dept: 'Arts', level: 'medium' },
                  { dept: 'Medicine', level: 'high' },
                  { dept: 'Law', level: 'medium' },
                  { dept: 'Education', level: 'low' },
                  { dept: 'Sciences', level: 'medium' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center text-sm ${
                      item.level === 'high' ? 'bg-red-100 text-red-800' :
                      item.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    <div className="font-medium">{item.dept}</div>
                    <div className="text-xs capitalize">{item.level}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Center */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Campaign Center</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-blue-800">Exam Stress Workshop</h4>
                    <p className="text-sm text-blue-600">Scheduled for Computer Science students</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    View Details
                  </button>
                </div>
                <button className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition-colors duration-200">
                  + Schedule New Campaign
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Export Weekly Report</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Schedule Intervention</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <AlertTriangle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Review Flagged Cases</span>
                </button>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Admin login</span>
                  <span className="text-gray-400">2m ago</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Report generated</span>
                  <span className="text-gray-400">1h ago</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Alert threshold updated</span>
                  <span className="text-gray-400">3h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;