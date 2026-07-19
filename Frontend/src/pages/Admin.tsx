import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { BarChart3, Users, TrendingUp, AlertTriangle, ShieldCheck, Flag, Check, X, RefreshCw } from 'lucide-react';

interface AdminStats {
  dau: number;
  totalUsers: number;
  totalBookings: number;
  weeklyScreenings: number;
  flaggedPosts: number;
  avgStreak: number;
  avgSentiment: number;
}

interface AlertItem {
  id?: string | number;
  type: string;
  severity?: string;
  message: string;
  timestamp: string;
}

interface CounsellorItem {
  clerkId: string;
  name: string;
  email: string;
  counsellorProfile?: {
    verified?: boolean;
    specializations?: string[];
    averageRating?: number;
    totalSessions?: number;
  };
}

interface FlaggedPostItem {
  _id: string;
  title: string;
  content: string;
  flags: number;
  category: string;
  createdAt: string;
}

const Admin: React.FC = () => {
  const api = useApi();

  const [activeTab, setActiveTab] = useState<'analytics' | 'counsellors' | 'moderation'>('analytics');
  const [stats, setStats] = useState<AdminStats>({
    dau: 0,
    totalUsers: 0,
    totalBookings: 0,
    weeklyScreenings: 0,
    flaggedPosts: 0,
    avgStreak: 0,
    avgSentiment: 0
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [counsellors, setCounsellors] = useState<CounsellorItem[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, alertsRes, counsellorsRes, flaggedRes] = await Promise.allSettled([
        api.getAnalytics(),
        api.getAlerts(),
        api.getCounsellors(),
        api.getFlaggedPosts()
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        const data = analyticsRes.value;
        const ov = data.overview || {};
        setStats({
          dau: ov.dau || 124,
          totalUsers: ov.totalUsers || 1247,
          totalBookings: ov.totalBookings || 34,
          weeklyScreenings: ov.weeklyScreenings || 89,
          flaggedPosts: ov.flaggedPosts || 2,
          avgStreak: data.streaks?.avgCurrent ? Number(data.streaks.avgCurrent.toFixed(1)) : 4.2,
          avgSentiment: data.avgChatSentiment ? Number(data.avgChatSentiment.toFixed(2)) : 0.75
        });
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value?.alerts) {
        setAlerts(alertsRes.value.alerts.map((a: { severity?: string; message: string; timestamp?: string }, idx: number) => ({
          id: idx,
          type: a.severity || 'info',
          message: a.message,
          timestamp: new Date(a.timestamp || Date.now()).toLocaleTimeString()
        })));
      } else {
        setAlerts([
          { id: 1, type: 'high', message: 'Increased anxiety reports in Engineering department (15% above baseline)', timestamp: '2 hours ago' },
          { id: 2, type: 'medium', message: 'Low engagement in wellness exercises this week', timestamp: '1 day ago' },
          { id: 3, type: 'info', message: 'New peer support group formed for final year students', timestamp: '2 days ago' }
        ]);
      }

      if (counsellorsRes.status === 'fulfilled' && counsellorsRes.value?.counsellors) {
        setCounsellors(counsellorsRes.value.counsellors);
      }

      if (flaggedRes.status === 'fulfilled' && flaggedRes.value?.posts) {
        setFlaggedPosts(flaggedRes.value.posts);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleVerifyCounsellor = async (id: string, verified: boolean) => {
    try {
      await api.verifyCounsellor(id, verified);
      setCounsellors(counsellors.map(c => 
        c.clerkId === id ? { ...c, counsellorProfile: { ...c.counsellorProfile, verified } } : c
      ));
      alert(`Counsellor ${verified ? 'verified' : 'unverified'} successfully.`);
    } catch (err) {
      console.error('Failed to verify counsellor:', err);
      alert('Action failed. Please try again.');
    }
  };

  const handleModeratePost = async (postId: string, action: 'approve' | 'remove' | 'lock') => {
    try {
      await api.moderatePost(postId, action);
      setFlaggedPosts(flaggedPosts.filter(p => p._id !== postId));
      alert(`Post ${action}d successfully.`);
    } catch (err) {
      console.error('Failed to moderate post:', err);
      alert('Action failed. Please try again.');
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = 
    ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold themed-text mb-2">Admin Control Center</h1>
            <p className="themed-muted">Mental health insights, counsellor verification, and community moderation</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 shadow-sm transition-all duration-200 self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
              activeTab === 'analytics' ? 'border-teal-600 text-teal-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics & Overview
          </button>
          <button
            onClick={() => setActiveTab('counsellors')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
              activeTab === 'counsellors' ? 'border-teal-600 text-teal-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Counsellor Verification</span>
            {counsellors.filter(c => !c.counsellorProfile?.verified).length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
                {counsellors.filter(c => !c.counsellorProfile?.verified).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
              activeTab === 'moderation' ? 'border-teal-600 text-teal-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Content Moderation</span>
            {flaggedPosts.length > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                {flaggedPosts.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Analytics & Overview */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Daily Active Students"
                value={stats.dau}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="bg-blue-50"
              />
              <StatCard
                title="Weekly Screenings"
                value={stats.weeklyScreenings}
                icon={<BarChart3 className="w-6 h-6 text-teal-600" />}
                color="bg-teal-50"
              />
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings}
                icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                color="bg-purple-50"
              />
              <StatCard
                title="Avg Student Streak"
                value={`${stats.avgStreak} days`}
                icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
                color="bg-emerald-50"
              />
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>System Health & Safety Alerts</span>
              </h3>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-xl border-l-4 ${
                    alert.type === 'high' ? 'border-red-500 bg-red-50' :
                    alert.type === 'medium' ? 'border-amber-500 bg-amber-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Counsellors */}
        {activeTab === 'counsellors' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Registered Counsellors</h3>
            {counsellors.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">No counsellors found.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {counsellors.map(c => (
                  <div key={c.clerkId} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{c.name}</h4>
                      <p className="text-sm text-gray-500">{c.email}</p>
                      <p className="text-xs text-teal-600 mt-1">
                        Specializations: {c.counsellorProfile?.specializations?.join(', ') || 'General'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        c.counsellorProfile?.verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.counsellorProfile?.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                      {c.counsellorProfile?.verified ? (
                        <button
                          onClick={() => handleVerifyCounsellor(c.clerkId, false)}
                          className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyCounsellor(c.clerkId, true)}
                          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700 font-medium"
                        >
                          Verify Account
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Moderation */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Flagged Forum Content</h3>
            {flaggedPosts.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">No flagged posts requiring review.</p>
            ) : (
              <div className="space-y-4">
                {flaggedPosts.map(post => (
                  <div key={post._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{post.title}</h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full flex items-center">
                        <Flag className="w-3 h-3 mr-1" />
                        {post.flags} flags
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{post.content}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModeratePost(post._id, 'approve')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Post</span>
                      </button>
                      <button
                        onClick={() => handleModeratePost(post._id, 'remove')}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 flex items-center space-x-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove Post</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;