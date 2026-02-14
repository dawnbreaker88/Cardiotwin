import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { LiveAssessmentPage } from './pages/LiveAssessmentPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsModal } from './components/SettingsModal';

function App() {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <BrowserRouter>
            <div className="h-screen w-screen bg-bg-primary text-white overflow-hidden flex">
                {/* Persistent Sidebar Navigation */}
                <Navbar onOpenSettings={() => setShowSettings(true)} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/assess" element={<LiveAssessmentPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                    </Routes>
                </div>

                {/* Global Modals */}
                {showSettings && (
                    <SettingsModal onClose={() => setShowSettings(false)} />
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;
