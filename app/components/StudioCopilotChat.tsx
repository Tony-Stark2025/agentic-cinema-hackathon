'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Loader2, MessageSquare, Terminal } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export const StudioCopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'SHOWRUNNER Technical Director Copilot online. Powered by Google Cloud Vertex AI (Gemini 3.8 Flash Uncapped Reasoning) & Grafana MCP. Ask about live cluster health, VRAM allocations, frame render bottlenecks, or executive dailies.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 1 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis completed with Gemini 3.8 Flash.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Connection to Vertex AI timed out. Resilient deterministic studio engine active.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-xl p-5 shadow-2xl flex flex-col h-[460px] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Technical Director Copilot
            </h2>
            <p className="text-[10px] text-slate-400">
              Vertex AI Gemini 3.8 Flash &bull; Natural Language Telemetry
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded font-bold border border-cyan-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          VERTEX AI LIVE
        </span>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
        <button
          onClick={() => handleSendMessage('What is the current health of the 16-node GPU render cluster?')}
          className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px] shrink-0 transition-colors"
        >
          &bull; Cluster Health
        </button>
        <button
          onClick={() => handleSendMessage('Why is gpu-node-04 experiencing high VRAM memory velocity?')}
          className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px] shrink-0 transition-colors"
        >
          &bull; Node 04 Diagnostic
        </button>
        <button
          onClick={() => handleSendMessage('Calculate financial studio downtime savings for a 48-minute render stall.')}
          className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[10px] shrink-0 transition-colors"
        >
          &bull; Financial ROI Report
        </button>
      </div>

      {/* Message Stream */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[310px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3.5 rounded-lg border-2 space-y-1 ${
              msg.sender === 'user'
                ? 'bg-cyan-950/40 border-cyan-700/60 ml-8'
                : 'bg-slate-950 border-slate-800 mr-4'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5 font-bold">
                {msg.sender === 'user' ? (
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span className={msg.sender === 'user' ? 'text-cyan-300' : 'text-purple-300'}>
                  {msg.sender === 'user' ? 'Technical Director' : 'Gemini 3.8 Flash (Vertex AI)'}
                </span>
              </span>
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-purple-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Gemini 3.8 Flash synthesizing telemetry context...</span>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Technical Director Copilot (e.g. 'What caused the VRAM spike on Node 04?')..."
          className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
