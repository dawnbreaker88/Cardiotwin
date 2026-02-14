import React, { useState } from 'react';
import { Activity, Database, Edit3, UserPlus } from 'lucide-react';
import { ManualPredictionForm } from './ManualPredictionForm';
import { PatientLookup } from './PatientLookup';

export function InputForm({ onManualSubmit, onPatientLoaded, onRegisterPatient, isLoading, patientData }) {
    const [activeTab, setActiveTab] = useState('lookup'); // 'lookup' or 'manual'

    return (
        <div className="glass-card p-6 h-full flex flex-col overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-purple-600 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Input Data</h2>
                </div>
                <button
                    onClick={onRegisterPatient}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-purple-400 hover:bg-white/10 transition-all"
                    title="Register New Patient"
                >
                    <UserPlus size={18} />
                </button>
            </div>

            {/* Tabs Toggle */}
            <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('lookup')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'lookup' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Database size={14} />
                    Patient Record
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'manual' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Edit3 size={14} />
                    Manual Entry
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'lookup' ? (
                    <PatientLookup
                        onDataLoaded={onPatientLoaded}
                        isLoading={isLoading}
                    />
                ) : (
                    <ManualPredictionForm
                        onSubmit={onManualSubmit}
                        isLoading={isLoading}
                        initialData={patientData}
                    />
                )}
            </div>
        </div>
    );
}
