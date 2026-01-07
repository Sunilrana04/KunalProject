import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, MapPin, Star, Plus, Settings, MousePointer2, TrendingUp, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { apiService } from '../../services/apiService';
import type { Profile } from '../../types';

const COLORS = ['#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3', '#FFF1F2'];

const AdminDashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const navigate = useNavigate();

  // Load profiles from API
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await apiService.getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    const locationCounts: Record<string, number> = {};
    profiles.forEach((p) => {
      locationCounts[p.location] = (locationCounts[p.location] || 0) + 1;
    });

    return {
      totalProfiles: profiles.length,
      featuredCount: profiles.filter((p) => p.isFeatured).length,
      totalContactClicks: profiles.reduce((sum, p) => sum + p.contactClicks, 0),
      locationCounts,
    };
  }, [profiles]);

  const chartData = Object.entries(stats.locationCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 sm:pt-28">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Welcome back! Here's what's happening on the platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <Link
            to="/admin/manage"
            className="flex-1 lg:flex-none bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition-all"
          >
            <Settings className="w-5 h-5" />
            Manage All
          </Link>
          <button
            onClick={() => navigate('/admin/manage?new=true')}
            className="flex-1 lg:flex-none bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all"
          >
            <Plus className="w-5 h-5" />
            New Profile
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-500" />}
          label="Total Profiles"
          value={stats.totalProfiles.toString()}
          trend="+12%"
          color="blue"
        />
        <StatCard
          icon={<MapPin className="w-6 h-6 text-green-500" />}
          label="Locations"
          value={Object.keys(stats.locationCounts).length.toString()}
          trend="Active"
          color="green"
        />
        <StatCard
          icon={<Star className="w-6 h-6 text-amber-500" />}
          label="Featured"
          value={stats.featuredCount.toString()}
          trend="High Reach"
          color="amber"
        />
        <StatCard
          icon={<MousePointer2 className="w-6 h-6 text-rose-500" />}
          label="Contact Clicks"
          value={stats.totalContactClicks.toString()}
          trend="+28%"
          color="rose"
        />
      </div>

      {/* Location Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[400px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-bold">Profiles by Location</h3>
            <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              Live Trends
            </div>
          </div>
          <div className="h-full w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F9FAFB' }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={32}>
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No profile data to display.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6">Top Locations</h3>
          <div className="space-y-6">
            {Object.entries(stats.locationCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([loc, count], idx) => (
                <div key={loc} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-400">0{idx + 1}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm sm:text-base">{loc}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">Urban Area</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-500">{count}</p>
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 whitespace-nowrap">
                      Profiles
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <button className="w-full mt-8 text-sm font-bold text-gray-500 hover:text-rose-500 transition-colors flex items-center justify-center gap-2">
            View All Cities <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  color: 'blue' | 'green' | 'amber' | 'rose';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
        <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg ${colorMap[color]}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">{label}</p>
        <h4 className="text-xl sm:text-2xl font-bold text-gray-900">{value}</h4>
      </div>
    </div>
  );
};

export default AdminDashboard;
