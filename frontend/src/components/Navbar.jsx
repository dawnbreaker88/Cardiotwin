import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Activity, History, Settings, User, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Navbar = ({ onOpenSettings }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Activity, label: 'Live Assessment', path: '/assess' },
        { icon: History, label: 'History', path: '/history' },
    ];

    return (
        <aside className={cn(
            "h-screen border-r border-white/10 bg-bg-secondary/30 backdrop-blur-md flex flex-col z-50 transition-all duration-300 relative",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Collapse Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center text-white z-[60] hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/40"
            >
                <Sparkles size={12} className={cn("transition-transform duration-300", isCollapsed ? "rotate-180" : "")} />
            </button>

            {/* Logo Section */}
            <div className={cn("p-6 border-b border-white/5 overflow-hidden transition-all", isCollapsed ? "px-5" : "px-6")}>
                <div className="flex items-center gap-3">
                    <div className="min-w-[40px] h-10 rounded-xl bg-accent-gradient flex items-center justify-center font-bold relative animate-pulse-slow shrink-0">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col whitespace-nowrap"
                        >
                            <h1 className="font-bold text-xl tracking-tight leading-none text-white">CardioTwin</h1>
                            <span className="text-[10px] text-purple-400 font-medium tracking-widest uppercase">AI Heart Twin</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 flex flex-col gap-2 mt-4 overflow-hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.label : ""}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden whitespace-nowrap",
                            isActive
                                ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon size={20} className={cn(
                            "transition-transform duration-300 group-hover:scale-110 shrink-0",
                            "group-hover:text-purple-400"
                        )} />
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-medium"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/5 flex flex-col gap-2 overflow-hidden">
                <button
                    onClick={onOpenSettings}
                    title={isCollapsed ? "Settings" : ""}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap overflow-hidden"
                >
                    <Settings size={20} className="shrink-0" />
                    {!isCollapsed && <span className="font-medium">Settings</span>}
                </button>
                <div className={cn(
                    "mt-2 p-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5 transition-all overflow-hidden",
                    isCollapsed ? "p-2 justify-center" : "p-3"
                )}>
                    <div className="min-w-[40px] h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border border-white/20 shrink-0">
                        <User size={20} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col overflow-hidden whitespace-nowrap"
                        >
                            <span className="text-sm font-semibold text-white truncate">Dr. Prabhath</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Cardiologist</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </aside>
    );
};
