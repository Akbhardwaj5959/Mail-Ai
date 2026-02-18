"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useChat } from '@ai-sdk/react';
import { RefreshCw, Menu, ArrowLeft, Send as SendIcon, Sparkles, X, Loader2, Wand2 } from 'lucide-react';
import Sidebar from './Sidebar';

const MailAIDashboard = () => {
  const { data: session } = useSession();

  
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('INBOX');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [isChatOpen, setIsChatOpen] = useState(false);

  
  const executeSendEmail = async (dataToUse) => {
    const payload = dataToUse || composeData;
    if (!payload.to || !payload.subject) { alert("⚠️ Missing To or Subject!"); return; }

    setIsSending(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Email Sent Successfully!");
        setIsComposeOpen(false);
        setComposeData({ to: '', subject: '', body: '' });
        if (activeTab === 'SENT') fetchEmails();
      } else {
        alert("❌ Failed to send email.");
      }
    } catch (e) {
      console.error(e);
      alert("❌ Network Error");
    }
    setIsSending(false);
  };

  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/chat',
    maxSteps: 5,
    body: {
      context: {
        activeTab,
        selectedEmail: selectedEmail ? {
          from: selectedEmail.from,
          subject: selectedEmail.subject,
          snippet: selectedEmail.snippet
        } : null
      }
    },
    onError: (e) => {
      console.error("AI Client Error:", e);
      alert("AI Error: " + (e.message || "Something went wrong"));
    },

    onToolCall: ({ toolCall }) => {
      console.log("🛠️ Jarvis Action:", toolCall.toolName);
      const args = toolCall.args;

      if (toolCall.toolName === 'draftEmail') {
        setComposeData({ to: args.to || '', subject: args.subject || '', body: args.body || '' });
        setIsComposeOpen(true);
        return '✅ Sir, I have prepared the draft in the compose window as requested.';
      }

      if (toolCall.toolName === 'sendDirectEmail') {
        setComposeData(args);
        if (confirm(`🤖 Jarvis: Confirming to send this email to ${args.to}?`)) {
          executeSendEmail(args);
          return '🚀 Mission accomplished! The email has been dispatched successfully.';
        }
        return 'Operation aborted by your command, sir.';
      }

      if (toolCall.toolName === 'changeView') {
        setActiveTab(args.view);
        return `📂 I have switched the view to ${args.view} for you.`;
      }

      if (toolCall.toolName === 'filterEmails') {
        handleFilter(args.query);
        return `🔍 I have filtered the emails matching: "${args.query}".`;
      }
    }
  });

  
  const handleAutoWrite = async (e) => {
    e.preventDefault();
    if (!selectedEmail) return;

    setIsGenerating(true);
    setIsChatOpen(true);

    const replyPrompt = `I am replying to an email from "${selectedEmail.from}" with Subject: "${selectedEmail.subject}". 
    The original message was: "${selectedEmail.snippet}". 
    Please write a professional reply and USE the 'draftEmail' tool to fill it in this window.`;

    setInput(replyPrompt);

    setTimeout(() => {
      handleSubmit();
      setIsGenerating(false);
    }, 500);
  };

  
  const fetchEmails = async () => {
    if (!session) return;
    setLoading(true);
    await silentFetchEmails();
    setLoading(false);
  };

  const silentFetchEmails = async () => {
    const labelMap = { 'INBOX': 'INBOX', 'SENT': 'SENT', 'DRAFTS': 'DRAFT', 'TRASH': 'TRASH' };
    try {
      const res = await fetch(`/api/emails?label=${labelMap[activeTab] || 'INBOX'}`);
      const data = await res.json();
      if (data.emails) {
        setEmails(data.emails);
        setFilteredEmails(data.emails);
      }
    } catch (e) { console.error("Sync Error:", e); }
  };

  const handleFilter = (query) => {
    if (!query) { setFilteredEmails(emails); return; }
    const q = query.toLowerCase();
    setFilteredEmails(emails.filter(e =>
      (e.subject || "").toLowerCase().includes(q) || (e.from || "").toLowerCase().includes(q)
    ));
  };

  useEffect(() => {
    if (session) {
      fetchEmails();
      const interval = setInterval(() => {
        silentFetchEmails();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [session, activeTab]);

  return (
    <div className="flex h-screen w-full text-gray-100 font-sans overflow-hidden relative bg-[#050505]">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-blue-900/10 opacity-20"></div>
      </div>

      <Sidebar
        session={session} activeTab={activeTab} setActiveTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen}
        onComposeClick={() => setIsComposeOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative z-10 bg-black/40 backdrop-blur-sm border-l border-white/5">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-400"><Menu className="w-6 h-6" /></button>
            <h2 className="text-xl font-bold text-white capitalize">{activeTab.toLowerCase()}</h2>
          </div>
          <button onClick={fetchEmails} className={`p-3 rounded-full bg-white/5 ${loading ? 'animate-spin text-blue-500' : 'text-gray-300'}`}><RefreshCw className="w-5 h-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? <div className="text-center mt-20 text-gray-500">Loading...</div> :
            filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <div key={email.id} onClick={() => setSelectedEmail(email)} className="group bg-[#121212]/80 hover:bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl cursor-pointer flex items-start gap-5 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-300 border border-white/10 shrink-0">{(email.from || "U").charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate w-[75%] group-hover:text-blue-300">{(email.from || "").replace(/<.*>/, '').trim()}</h3>
                    <p className="text-gray-400 text-sm truncate"><span className="text-gray-200 font-medium mr-2">{email.subject}</span>- {email.snippet}</p>
                  </div>
                </div>
              ))
            ) : <div className="text-center text-gray-500 mt-20">No emails here.</div>}
        </div>
      </main>

      {isComposeOpen && (
        <div style={{ zIndex: 10000 }} className="fixed inset-0 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsComposeOpen(false)}></div>
          <div className="relative bg-[#09090b] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col p-6 space-y-4">
            <div className="flex justify-between"><h3 className="text-white font-bold">New Message</h3><button onClick={() => setIsComposeOpen(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <input className="bg-[#1c1c1e] border border-white/5 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="To" value={composeData.to || ""} onChange={(e) => setComposeData({ ...composeData, to: e.target.value })} />
            <input className="bg-[#1c1c1e] border border-white/5 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="Subject" value={composeData.subject || ""} onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })} />
            <div className="relative">
              <textarea className="w-full bg-[#1c1c1e] border border-white/5 rounded-xl p-3 text-white h-64 focus:border-blue-500 outline-none resize-none" placeholder="Message..." value={composeData.body || ""} onChange={(e) => setComposeData({ ...composeData, body: e.target.value })} />
              <button
                onClick={handleAutoWrite}
                disabled={isGenerating}
                className="absolute bottom-4 right-4 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                {isGenerating ? "Processing..." : "AI Write Reply"}
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => executeSendEmail()} disabled={isSending} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center gap-2">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isChatOpen && (
        <button onClick={() => setIsChatOpen(true)} style={{ zIndex: 99999 }} className="fixed bottom-8 right-8 flex items-center gap-3 pl-5 pr-2 py-2 bg-[#0f1115] border border-blue-500/30 rounded-full shadow-2xl hover:scale-105 transition-all">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mr-2">Ask Jarvis</span>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg"><Sparkles className="w-5 h-5 text-white" /></div>
        </button>
      )}

      {isChatOpen && (
        <div style={{ zIndex: 99999 }} className="fixed inset-0 flex items-end sm:items-center justify-center sm:justify-end sm:px-8 sm:pb-8 pointer-events-none">
          <div className="fixed inset-0 pointer-events-auto" onClick={() => setIsChatOpen(false)}></div>
          <div className="relative w-full sm:w-[400px] h-[600px] bg-[#09090b]/95 backdrop-blur-2xl border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col pointer-events-auto">
            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-blue-400" /><h3 className="font-bold text-white">Jarvis AI</h3></div>
              <button onClick={() => setIsChatOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm transition-all duration-300 ${m.role === 'user' ? 'bg-blue-600 text-white shadow-md' : 'bg-[#1c1c1e] text-gray-200 border border-white/5 shadow-lg'}`}>
                    <span className="leading-relaxed whitespace-pre-wrap">{m.content}</span>
                  </div>
                </div>
              ))}
              
     
              {isLoading && (
                <div className="flex justify-start items-center gap-2 ml-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-medium uppercase tracking-widest">Processing</span>
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (!input?.trim()) return; handleSubmit(e); }} className="p-4 border-t border-white/5 bg-black/40">
              <div className="flex gap-2">
                <input value={input} onChange={handleInputChange} placeholder="Command Jarvis..." className="flex-1 bg-[#1c1c1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all" />
                <button type="submit" className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-colors shadow-lg"><SendIcon className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEmail && (
        <div style={{ zIndex: 9000 }} className="fixed inset-0 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedEmail(null)}></div>
          <div className="relative bg-[#09090b] w-full max-w-4xl h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col p-8 overflow-hidden transition-all">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setSelectedEmail(null)} className="text-gray-400 hover:text-white flex gap-2 items-center transition-colors"><ArrowLeft className="w-5 h-5" /> Back</button>
              <button onClick={() => { setComposeData({ to: selectedEmail.from, subject: `Re: ${selectedEmail.subject}`, body: `\n\n--- On ${selectedEmail.date}, ${selectedEmail.from} wrote: ---\n${selectedEmail.snippet}` }); setIsComposeOpen(true); }} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors" >Reply</button>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{selectedEmail.subject}</h1>
            <div className="text-gray-400 mb-8 font-medium">{selectedEmail.from}</div>
            <div className="text-gray-300 leading-relaxed overflow-y-auto custom-scrollbar whitespace-pre-wrap">{selectedEmail.snippet}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailAIDashboard;