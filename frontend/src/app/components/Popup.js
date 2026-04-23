"use client";
import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Popup({ message, type = "error", isVisible, onClose, duration = 5000 }) {
    // Auto-close after duration
    useEffect(() => {
        if (isVisible && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    // Style variants based on type
    const styles = {
        error: {
            bg: "bg-red-50 border-red-500",
            text: "text-red-800",
            icon: <AlertCircle className="text-red-500" size={20} />,
        },
        success: {
            bg: "bg-green-50 border-green-500",
            text: "text-green-800",
            icon: <CheckCircle className="text-green-500" size={20} />,
        },
        warning: {
            bg: "bg-yellow-50 border-yellow-500",
            text: "text-yellow-800",
            icon: <AlertTriangle className="text-yellow-500" size={20} />,
        },
        info: {
            bg: "bg-blue-50 border-blue-500",
            text: "text-blue-800",
            icon: <Info className="text-blue-500" size={20} />,
        },
    };

    const currentStyle = styles[type] || styles.error;

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`flex items-center gap-3 p-4 rounded-lg border-l-4 shadow-lg ${currentStyle.bg}`}>
                {currentStyle.icon}
                <p className={`text-sm font-medium ${currentStyle.text}`}>{message}</p>
                <button
                    onClick={onClose}
                    className={`ml-4 p-1 rounded hover:bg-black/10 transition-colors ${currentStyle.text}`}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
