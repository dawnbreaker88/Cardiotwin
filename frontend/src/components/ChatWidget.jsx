import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User as UserIcon, Bot, Stethoscope, HeartHandshake, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export function ChatWidget({ patientContext, isOpen, onClose }) {
    // const [isOpen, setIsOpen] = useState(false); // Controlled by parent
    const [mode, setMode] = useState('patient'); // 'patient' or 'doctor'
    const [messages, setMessages] = useState([
        { role: 'model', text: "Hello! I'm CardioTwin. How can I help you today?", mode: 'patient' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen]);

    // Switch greeting when mode changes if chat is empty-ish
    useEffect(() => {
        if (messages.length <= 1) {
            if (mode === 'doctor') {
                setMessages([{ role: 'model', text: "CardioTwin Clinical Assistant initialized. Ready for analysis.", mode: 'doctor' }]);
            } else {
                setMessages([{ role: 'model', text: "Hello! I'm CardioTwin. How can I help you today?", mode: 'patient' }]);
            }
        }
    }, [mode]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input, mode: mode };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Filter history to strictly relevant? Or keep all? 
            // Gemini handles history best if it's consistent. We'll pass all for continuity.
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await axios.post('http://localhost:5000/api/chat', {
                message: input,
                history: history,
                patient_context: JSON.stringify(patientContext),
                mode: mode
            });

            const aiMsg = { role: 'model', text: response.data.response, mode: mode };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please try again.", mode: mode }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        />

                        {/* Sidebar Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0f0f11] border-l border-white/10 shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className={`p-4 border-b border-white/10 flex flex-col gap-4 ${mode === 'doctor' ? 'bg-cyan-950/30' : 'bg-purple-900/20'
                                }`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {mode === 'doctor' ? <Stethoscope className="text-cyan-400" /> : <HeartHandshake className="text-pink-400" />}
                                        <div>
                                            <h2 className="font-bold text-white text-lg">CardioTwin AI</h2>
                                            <p className="text-xs text-gray-400">
                                                {mode === 'doctor' ? 'Clinical Decision Support' : 'Patient Companion'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>

                                {/* Mode Toggle */}
                                <div className="bg-black/40 p-1 rounded-xl flex relative">
                                    <motion.div
                                        className={`absolute top-1 bottom-1 w-[48%] rounded-lg shadow-sm ${mode === 'doctor' ? 'left-[50%] bg-cyan-700' : 'left-1 bg-purple-600'
                                            }`}
                                        animate={{
                                            left: mode === 'doctor' ? '50%' : '4px',
                                            backgroundColor: mode === 'doctor' ? '#0e7490' : '#9333ea'
                                        }}
                                    />
                                    <button
                                        onClick={() => setMode('patient')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${mode === 'patient' ? 'text-white' : 'text-gray-400'}`}
                                    >
                                        <UserIcon size={16} /> Patient
                                    </button>
                                    <button
                                        onClick={() => setMode('doctor')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium z-10 transition-colors ${mode === 'doctor' ? 'text-white' : 'text-gray-400'}`}
                                    >
                                        <Stethoscope size={16} /> Doctor
                                    </button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                            ? 'bg-gray-700'
                                            : mode === 'doctor' ? 'bg-cyan-900 border border-cyan-500/30' : 'bg-pink-900 border border-pink-500/30'
                                            }`}>
                                            {msg.role === 'user' ? <UserIcon size={14} className="text-gray-300" /> : <Bot size={14} className={mode === 'doctor' ? 'text-cyan-400' : 'text-pink-400'} />}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-md ${msg.role === 'user'
                                            ? 'bg-gray-800 text-white rounded-tr-none'
                                            : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                                            }`}>
                                            {msg.role === 'model' ? (
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-white">
                                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${mode === 'doctor' ? 'bg-cyan-900' : 'bg-pink-900'}`}>
                                            <Bot size={14} className="text-white/50" />
                                        </div>
                                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 flex gap-2 items-center">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-[#0f0f11] border-t border-white/10">
                                <div className="flex gap-2 bg-black/40 border border-white/10 rounded-xl p-1 pl-4 focus-within:border-white/20 transition-colors">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder={mode === 'doctor' ? "Enter clinical query..." : "Ask me anything..."}
                                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm py-2"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        className={`p-2 rounded-lg transition-all ${input.trim()
                                            ? mode === 'doctor' ? 'bg-cyan-600 hover:bg-cyan-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="text-center mt-2">
                                    <span className="text-[10px] text-gray-600">
                                        CardioTwin AI can make mistakes. Verify clinical outputs.
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
