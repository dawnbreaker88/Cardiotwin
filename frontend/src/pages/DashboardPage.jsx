import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, AlertTriangle, CheckCircle, TrendingUp, Loader2, UserPlus } from 'lucide-react';
import { RegisterPatientModal } from '../components/RegisterPatientModal';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 transition-all hover:bg-white/10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
            <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/stats');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-bg-primary">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    // Default trend if empty
    const trendData = stats?.recent_trend?.length > 0 ? stats.recent_trend : [
        { date: 'Initial', count: 0 }
    ];

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-bg-primary custom-scrollbar">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white">Clinical Dashboard</h2>
                    <p className="text-gray-400">Real-time overview of patient cardiotoxicity risks</p>
                </div>
                <button
                    onClick={() => setShowRegister(true)}
                    className="px-6 py-3 bg-accent-gradient text-white rounded-2xl font-bold shadow-lg shadow-purple-900/40 hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    Register New Patient
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={Users} label="Patients Analyzed" value={stats?.total_patients || 0} color="bg-blue-500" />
                <StatCard icon={AlertTriangle} label="Critical Cases" value={stats?.high_risk || 0} color="bg-red-500" />
                <StatCard icon={TrendingUp} label="Avg Risk Score" value={`${stats?.avg_risk || 0}%`} color="bg-purple-500" />
                <StatCard icon={CheckCircle} label="System Status" value="Healthy" color="bg-green-500" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-3xl bg-bg-secondary/50 border border-white/5 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-6">Assessment Volume (Last 7 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1e2d', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-bg-secondary/50 border border-white/5 backdrop-blur-sm flex flex-col justify-center items-center text-center p-12">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <TrendingUp className="text-purple-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Predictive Insights</h3>
                    <p className="text-gray-400 text-sm max-w-xs">
                        The current average risk score is {stats?.avg_risk || 0}%.
                        Monitor "Critical Cases" for immediate intervention requirements.
                    </p>
                    <button className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20">
                        View Detailed Reports
                    </button>
                </div>
            </div>

            {showRegister && (
                <RegisterPatientModal
                    onClose={() => setShowRegister(false)}
                    onSuccess={fetchStats}
                />
            )}
        </div>
    );
};
