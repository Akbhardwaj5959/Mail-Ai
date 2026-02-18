import React from 'react';
import { Mail, Send, FileText, Trash2, Plus, LogOut, X } from 'lucide-react';
import { signOut, signIn } from "next-auth/react";

const Sidebar = ({ 
  session, 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen,
  onComposeClick 
}) => {
  const user = session?.user;

  // Helper to check active state
  const isActive = (id) => activeTab === id;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full
        w-64 flex-shrink-0 flex flex-col 
        bg-black/40 backdrop-blur-xl border-r border-white/10
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header / Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3 font-bold text-xl tracking-wide text-white">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span>MailAI</span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Compose Button */}
        <div className="p-6">
          <button 
            onClick={onComposeClick}
            className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Compose</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarItem 
            icon={<Mail />} label="Inbox" 
            active={isActive('INBOX')} 
            onClick={() => { setActiveTab('INBOX'); setIsMobileOpen(false); }} 
          />
          <SidebarItem 
            icon={<Send />} label="Sent" 
            active={isActive('SENT')} 
            onClick={() => { setActiveTab('SENT'); setIsMobileOpen(false); }} 
          />
          <SidebarItem 
            icon={<FileText />} label="Drafts" 
            active={isActive('DRAFTS')} 
            onClick={() => { setActiveTab('DRAFTS'); setIsMobileOpen(false); }} 
          />
          <SidebarItem 
            icon={<Trash2 />} label="Trash" 
            active={isActive('TRASH')} 
            onClick={() => { setActiveTab('TRASH'); setIsMobileOpen(false); }} 
          />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 mt-auto bg-black/20">
          {user ? (
            <div className="flex items-center gap-3">
              {user.image ? (
                <img src={user.image} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user.name?.[0] || "U"}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{user.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user.email || ""}</p>
              </div>
              <button 
                onClick={() => signOut()} 
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn("google")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold transition-colors"
            >
              Sign In with Google
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

// Item Component
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
    }`}
  >
    {React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'text-blue-400' : 'group-hover:text-white'}` })}
    <span className="font-medium">{label}</span>
  </button>
);

export default Sidebar;