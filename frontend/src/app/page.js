"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // Import the dynamic loader
import { askAI } from "./lib/api";

// --- THE FIX IS HERE ---
// We import the PDFViewer dynamically with "ssr: false"
// This prevents the server from ever seeing the PDF code, stopping all hook errors.
const PDFViewer = dynamic(() => import("./components/PDFViewer"), {
  ssr: false,
  loading: () => <div className="p-10 text-black">Loading PDF Engine...</div>,
});

export default function Home() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    const newHistory = [...history, { role: "user", text: question }];
    setHistory(newHistory);
    setQuestion("");
    setIsLoading(true);

    const fakePageContext = "The user is reading a book about Philosophy.";

    const answer = await askAI(question, fakePageContext);

    setHistory([...newHistory, { role: "ai", text: answer }]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      
      {/* LEFT SIDE: PDF Viewer (Now Isolated) */}
      <div className="w-3/4 h-full border-r border-gray-700 bg-white text-black">
        <PDFViewer fileUrl="/sample.pdf" />
      </div>

      {/* RIGHT SIDE: Chat Interface */}
      <div className="w-1/4 flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl font-bold text-blue-400">AI Companion</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 && (
            <p className="text-gray-500 text-center mt-10">Ask me anything...</p>
          )}
          
          {history.map((msg, index) => (
            <div key={index} className={`p-3 rounded-lg ${msg.role === "user" ? "bg-blue-600 ml-8" : "bg-gray-700 mr-8"}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          ))}

          {isLoading && <p className="text-gray-400 text-sm animate-pulse">Thinking...</p>}
        </div>

        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..." 
              className="flex-1 p-2 rounded bg-gray-900 text-white focus:outline-none border border-gray-700 focus:border-blue-500"
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}