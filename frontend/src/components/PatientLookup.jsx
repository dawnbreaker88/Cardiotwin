import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, User, Filter } from 'lucide-react';

export function PatientLookup({ onDataLoaded, isLoading: externalLoading }) {
    const [allIds, setAllIds] = useState({ Safe: [], Warning: [], Critical: [] });
    const [selectedId, setSelectedId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All'); // All, Safe, Warning, Critical
    const [loadingIds, setLoadingIds] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIds();
    }, []);

    const fetchIds = async () => {
        setLoadingIds(true);
        try {
            const res = await axios.get('http://localhost:5000/api/patients');
            // Backend now returns { Safe: [], Warning: [], Critical: [], count: ... } for ids
            if (res.data.Safe) {
                setAllIds(res.data);
            } else if (res.data.ids) {
                // Fallback for old API structure if cached
                setAllIds({ Safe: res.data.ids, Warning: [], Critical: [] });
            }
        } catch (err) {
            console.error("Failed to load patient IDs", err);
            setError("Failed to load patient list");
        } finally {
            setLoadingIds(false);
        }
    };

    const handleLoadPatient = async () => {
        if (!selectedId) return;
        setFetchingDetails(true);
        setError(null);
        try {
            const res = await axios.get(`http://localhost:5000/api/patient/${selectedId}`);
            onDataLoaded(res.data);
        } catch (err) {
            console.error("Failed to load patient details", err);
            setError("Patient not found or server error");
        } finally {
            setFetchingDetails(false);
        }
    };

    // Flatten IDs based on filter
    const getFilteredList = () => {
        let list = [];
        if (activeFilter === 'All') {
            list = [...allIds.Safe, ...allIds.Warning, ...allIds.Critical];
        } else {
            list = allIds[activeFilter] || [];
        }

        // Apply Search
        return list.filter(id =>
            id.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 50); // Limit dropdown size
    };

    const filteredIds = getFilteredList();

    const filters = ['All', 'Safe', 'Warning', 'Critical'];

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-400">Patient Lookup</h3>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => { setActiveFilter(filter); setSearchQuery(''); setSelectedId(''); }}
                        className={`flex-1 text-[10px] font-medium py-1.5 rounded transition-all ${activeFilter === filter
                                ? getFilterColor(filter)
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Search ID ({activeFilter})</label>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedId('');
                        }}
                        placeholder={`Search ${activeFilter === 'All' ? 'Patient' : activeFilter} ID...`}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    />
                </div>
            </div>

            {/* Dropdown List */}
            <div className="bg-black/20 rounded-lg p-2 h-40 overflow-y-auto custom-scrollbar">
                {loadingIds ? (
                    <div className="text-xs text-gray-500 px-2 py-1">Loading IDs...</div>
                ) : filteredIds.length > 0 ? (
                    filteredIds.map(id => (
                        <button
                            key={id}
                            onClick={() => {
                                setSelectedId(id);
                                setSearchQuery(id);
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedId === id ? 'bg-purple-500/20 text-purple-300' : 'hover:bg-white/5 text-gray-300'}`}
                        >
                            {id}
                        </button>
                    ))
                ) : (
                    <div className="text-xs text-gray-500 px-2 py-1">No {activeFilter} patients found</div>
                )}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLoadPatient}
                disabled={!selectedId || fetchingDetails || externalLoading}
                className="w-full bg-accent-gradient py-3 rounded-xl font-semibold text-white shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {fetchingDetails || externalLoading ? (
                    'Loading...'
                ) : (
                    <>
                        <User size={16} />
                        Load Patient Record
                    </>
                )}
            </motion.button>

            {error && (
                <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}

function getFilterColor(filter) {
    switch (filter) {
        case 'Safe': return 'bg-green-500/20 text-green-300';
        case 'Warning': return 'bg-yellow-500/20 text-yellow-300';
        case 'Critical': return 'bg-red-500/20 text-red-300';
        default: return 'bg-purple-500/20 text-purple-300';
    }
}
