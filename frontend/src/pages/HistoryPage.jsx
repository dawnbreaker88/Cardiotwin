import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, Download, ExternalLink, Loader2 } from 'lucide-react';

export const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/history');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        item.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.risk_level.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-bg-primary">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-bg-primary custom-scrollbar">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Assessment History</h2>
                    <p className="text-gray-400">View and manage past clinical assessments</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                    <Download size={18} />
                    <span>Export Logs</span>
                </button>
            </header>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Patient ID or Risk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                </div>
                <button className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center gap-2">
                    <Filter size={20} />
                    <span>Filter</span>
                </button>
            </div>

            <div className="bg-bg-secondary/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-bold">ID</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-bold">Patient</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-bold">Timestamp</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-bold">Risk Level</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-bold">Score</th>
                            <th className="p-4 text-xs uppercase tracking-wider text-gray-500 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.length > 0 ? filteredHistory.map((item) => (
                            <tr key={item.assessment_id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                                <td className="p-4 font-mono text-purple-400 text-xs">{item.assessment_id.slice(-8)}</td>
                                <td className="p-4 text-white font-medium">{item.patient_id}</td>
                                <td className="p-4 text-gray-400 text-sm">{formatDate(item.timestamp)}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.risk_level === 'Critical' ? 'bg-red-500/20 text-red-500' :
                                            item.risk_level === 'Warning' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-green-500/20 text-green-500'
                                        }`}>
                                        {item.risk_level}
                                    </span>
                                </td>
                                <td className="p-4 text-white font-bold">{(item.risk_score * 100).toFixed(1)}%</td>
                                <td className="p-4 text-right">
                                    <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                        <ExternalLink size={18} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-gray-500 font-medium">
                                    No assessment records found. Run a "Live Assessment" to begin logging data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
