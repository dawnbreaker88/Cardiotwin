import React, { useState } from 'react';
import { X, Key, Check } from 'lucide-react';
import axios from 'axios';

export function SettingsModal({ onClose }) {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState('idle'); // idle, saving, success, error

    const handleSave = async () => {
        setStatus('saving');
        try {
            await axios.post('http://localhost:5000/api/config', { api_key: apiKey });
            setStatus('success');
            setTimeout(onClose, 1000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bg-secondary border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Key className="text-purple-500" />
                        Configuration
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><X /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Google Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Start with the Free tier at <a href="https://ai.google.dev" target="_blank" className="text-purple-400 underline">ai.google.dev</a>
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!apiKey || status === 'saving'}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${status === 'success' ? 'bg-green-500 text-white' :
                                status === 'error' ? 'bg-red-500 text-white' :
                                    'bg-white text-black hover:bg-gray-200'
                            }`}
                    >
                        {status === 'saving' ? 'Validating...' :
                            status === 'success' ? 'Connected!' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
