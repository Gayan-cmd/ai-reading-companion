"use client";

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// STABLE WORKER CONFIGURATION

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl, onPageChange }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(0.7);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
        setLoading(false);
        setError(null);
    }

    function onDocumentLoadError(error) {
        setError("Failed to load PDF file.");
        setLoading(false);
        setNumPages(null);
    }

    async function onPageLoadSuccess(page) {
        try {
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item) => item.str).join(" ");
            if (onPageChange) {
                onPageChange(text);
            }
        } catch (error) {
            console.error("Text extraction failed", error);
        }
    }

    const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
    const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
    const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

    return (
        <div className="flex flex-col h-full bg-white text-gray-900 border-r border-gray-200">
            
            {/* --- TOOLBAR --- */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 shadow-md">
                
                {/* 1. Page Counter (Light Style) */}
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-gray-300">
                    <span className="text-sm font-mono text-gray-700">
                        Page <span className="text-gray-900 font-bold">{pageNumber}</span> / {numPages || "--"}
                    </span>
                </div>

                {/* 2. Navigation Icons */}
                <div className="flex gap-1">
                    <button 
                        onClick={goToPrevPage} 
                        disabled={pageNumber <= 1}
                        className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-30 transition-colors text-gray-700"
                        title="Previous Page"
                    >
                        {/* We use the Icon component instead of text */}
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={goToNextPage} 
                        disabled={pageNumber >= numPages}
                        className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-30 transition-colors text-gray-700"
                        title="Next Page"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* 3. Zoom Controls */}
                <div className="flex items-center gap-2">
                    <button onClick={zoomOut} className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-700">
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-xs text-gray-600 w-10 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button onClick={zoomIn} className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-700">
                        <ZoomIn size={18} />
                    </button>
                </div>
            </div>

            {/* --- PDF AREA --- */}
            <div className="flex-1 overflow-auto flex justify-center p-8 bg-gray-50">
                
                {/* Show error if PDF failed to load */}
                {error && (
                    <div className="flex items-center gap-2 text-red-600 mt-20">
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Show Spinner if loading and no error */}
                {loading && !error && (
                    <div className="flex items-center gap-2 text-gray-600 mt-20">
                        <Loader2 className="animate-spin" /> Loading PDF...
                    </div>
                )}
                
                {/* Hide default loading text by setting loading={null} */}
                {!error && (
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={null} 
                        className="shadow-2xl"
                    >
                        <Page 
                            pageNumber={pageNumber} 
                            scale={scale}
                            onLoadSuccess={onPageLoadSuccess}
                            renderTextLayer={true} 
                            renderAnnotationLayer={false}
                            className="border border-gray-300"
                        />
                    </Document>
                )}
            </div>
        </div>
    );

}