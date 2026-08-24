'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'GEMINI';
  text: string;
  modelUsed?: string;
  timestamp: number;
}

export const StudioCopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'GEMINI',
      text: `🎬 SHOWRUNNER Technical Director Copilot online. Powered by Google Gemini 3.x Flash & Grafana MCP.\nAsk me about render cluster health, VRAM allocations, frame render bottlenecks, or executive dailies.`,
      modelUsed: 'gemini-3.1-flash',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-reply-${Date.now()}`,
            sender: 'GEMINI',
            text: data.reply,
            modelUsed: data.modelUsed,
            timestamp: Date.now()
          }
        ]);
      } else {
        throw new Error(data.error || 'Chat request failed');
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'GEMINI',
          text: `[SYSTEM ERROR] Failed to connect to Gemini 3.x. Check API key or network connection.`,
          modelUsed: 'gemini-3.1-flash',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 shadow-lg flex flex-col h-[480px]">
      <div className="flex items-center justify-between border-b border-studio-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Technical Director Interactive Console (Gemini 3.x Flash)
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-700/40 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          LIVE MCP BRIDGE
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
        {messages.map(msg => {
          const isUser = msg.sender === 'USER';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div
                className={`p-3 rounded-lg max-w-[85%] text-xs font-sans whitespace-pre-line leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-studio-950 font-medium'
                    : 'bg-studio-850 border border-studio-700/70 text-slate-200'
                }`}
              >
                {!isUser && msg.modelUsed && (
                  <div className="text-[9px] font-mono text-purple-400 mb-1 font-bold">
                    {msg.modelUsed}
                  </div>
                )}
                {msg.text}
              </div>
              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-amber-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Technical Director Copilot (e.g. 'Are we on track for tonight's 4K render dailies?')..."
          className="flex-1 bg-studio-950 border border-studio-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-studio-950 font-bold transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
