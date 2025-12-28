import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Download, FileText, Loader, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf";

export function AIReportModal({ onClose, patientData, prediction }) {
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setError(null);
                const response = await axios.post('http://localhost:5000/api/generate-report', {
                    patient_data: patientData,
                    prediction: prediction
                });

                if (response.data.error) {
                    throw new Error(response.data.error);
                }

                setReport(response.data.report);
            } catch (err) {
                console.error(err);
                const msg = err.response?.data?.error || err.message || "Unknown error";
                setError(`Error generating report: ${msg}. Please check your API Key configuration.`);
                setReport('');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [patientData, prediction]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Simple PDF formatting
        doc.setFontSize(22);
        doc.text("CardioTwin Health Report", 20, 20);

        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);
        doc.text("------------------------------------------------", 20, 35);

        // Split markdown into lines and add (very basic text rendering)
        // For production, use a library like html2pdf or advanced jspdf splitting
        const lines = doc.splitTextToSize(report.replace(/#/g, ''), 170); // Remove markdown headers for plain text
        doc.text(lines, 20, 45);

        doc.save(`CardioTwin_Report_${new Date().toLocaleDateString()}.pdf`);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-bg-secondary border border-white/10 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <FileText className="text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">CardioTwin AI Report</h2>
                            <span className="text-xs text-gray-400">Powered by Gemini 3 Flash</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={loading || error}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                            title="Download PDF"
                        >
                            <Download size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0f0f11]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader className="animate-spin text-purple-500" size={40} />
                            <p className="text-gray-400 animate-pulse">Analyzing cardiac patterns...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <AlertTriangle className="text-red-500" size={48} />
                            <p className="text-red-400 max-w-md">{error}</p>
                            <button onClick={onClose} className="text-gray-400 hover:text-white underline mt-2">Close</button>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none prose-headings:text-purple-100 prose-a:text-purple-400">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
