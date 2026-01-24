"use client";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { askAI } from "./lib/api";
import { Send, Bot, User, Sparkles, Square } from 'lucide-react';
import { useRouter } from "next/navigation";

const PDFViewer = dynamic(() => import("./components/PDFViewer"), {
  ssr: false,
  loading: () => <div className="p-10 text-black">Loading PDF Engine...</div>,
});

export default function Home() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageContext, setPageContext] = useState("");

  const router = useRouter();

  useEffect(() => { 
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push('/login');
    }
  },[router]);


  const messagesEndRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false); // Are we currently streaming text?
  const stopTypingRef = useRef(false); // The "Emergency Brake"
  const chatContainerRef = useRef(null); // To measure scroll position

  // 2. Automatically scroll to it whenever 'history' or 'isLoading' changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStop = () => {
    stopTypingRef.current = true; // Pull the brake
  };

  useEffect(() => {
    scrollToBottom();
  }, [isLoading]);

  // --- NEW FUNCTION: TYPEWRITER EFFECT ---
  const simulateStreaming = async (fullText) => {
    setHistory(prev => [...prev, { role: "ai", text: "" }]);

    // Reset the "Brake" before starting
    stopTypingRef.current = false;
    setIsTyping(true);

    let currentText = "";

    for (let i = 0; i < fullText.length; i++) {
      // 1. CHECK THE BRAKE: If user clicked Stop, break the loop
      if (stopTypingRef.current) {
        break;
      }

      currentText += fullText[i];

      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].text = currentText;
        return newHistory;
      });

      // 2. SMART SCROLL LOGIC
      // Only scroll to bottom if the user is ALREADY near the bottom.
      // If they scrolled up to read history, don't disturb them.
      const container = chatContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 15));
    }

    setIsTyping(false); // Streaming finished
  };

  const handleSend = async () => {
    if (!question.trim()) return;

    const newHistory = [...history, { role: "user", text: question }];
    setHistory(newHistory);
    setQuestion("");
    setIsLoading(true);


    try {
    
      const contextToSend = pageContext || "Context not found.";
      const answer = await askAI(question, contextToSend);

      setIsLoading(false);
  
      await simulateStreaming(answer);

      
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      setIsLoading(false);
      setIsTyping(false);
      setHistory(prev => [...prev, { role: "ai", text: "Sorry, something went wrong." }]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* LEFT: PDF Viewer */}
      <div className="w-3/4 h-full border-r border-gray-700 bg-white text-black">
        {/* CONCEPT: callback prop
            'onPageChange' is the name of the prop we defined in the Child.
            'setPageContext' is the function we want the Child to call.
            This connects the two components together.
        */}
        <PDFViewer
          fileUrl="/sample.pdf"
          onPageChange={setPageContext}
        />
      </div>


      {/* RIGHT: Chat Interface */}
      <div className="w-1/4 flex flex-col h-full bg-gray-900 border-l border-gray-700">

        {/* A. HEADER */}
        <div className="p-4 border-b border-gray-800 bg-gray-900 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles size={18} />
            <h2 className="font-bold text-lg tracking-wide">AI Assistant</h2>
          </div>
          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${pageContext ? "bg-green-500" : "bg-red-500"}`}></div>
            {pageContext ? "Reading Page Context" : "No Context Detected"}
          </div>
        </div>

        {/* B. MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-900/50"
          ref={chatContainerRef}
        >
          {history.length === 0 && (
            <div className="text-center mt-20 opacity-30">
              <Bot size={48} className="mx-auto mb-3" />
              <p>Ask me anything about this page!</p>
            </div>
          )}

          {history.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-purple-600"}`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div className={`p-3 max-w-[85%] text-sm leading-relaxed shadow-md ${msg.role === "user"
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm" // User Bubble style
                : "bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm border border-gray-700" // AI Bubble style
                }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Loading Animation Bubble */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}

          {/* Invisible element to auto-scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* C. INPUT AREA */}
        <div className="p-4 bg-gray-900 border-t border-gray-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..."
              disabled={isLoading || isTyping}
              className="w-full bg-gray-800 text-white pl-4 pr-12 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner diabled:opacity-50"
            />
            {isTyping ? (
              <button
                onClick={handleStop}
                className="absolute right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors animate-pulse"
                title="Stop Generating"
              >
                <Square size={18} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!question.trim() || isLoading}
                className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            )}
          </div>
          <p className="text-center text-[10px] text-gray-600 mt-2">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}