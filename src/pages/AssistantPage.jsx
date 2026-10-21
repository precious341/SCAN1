import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Trash2, 
  Activity, 
  ExternalLink,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileText,
  ChevronDown,
  Bot,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopHeader from '../components/layout/TopHeader.jsx';
import FormattedMessage from '../components/assistant/FormattedMessage.jsx';
import api from '../services/api.js';

export default function AssistantPage() {
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConvSidebar, setShowConvSidebar] = useState(true);
  
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(searchParams.get('reportId') || '');
  
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConv, setLoadingConv] = useState(true);
  const [error, setError] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const suggestedQuestions = [
    'What does an elevated White Blood Cell (WBC) count typically indicate?',
    'How do I interpret hemoglobin levels between 11.5 and 12.0 g/dL?',
    'What questions should I ask my doctor about out-of-range biomarkers?',
    'Can mild dehydration influence hematocrit or electrolyte readings?',
    'What is the difference between total cholesterol and LDL cholesterol?'
  ];

  useEffect(() => {
    initAssistant();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const initAssistant = async () => {
    try {
      setLoadingConv(true);
      setError('');

      // 1. Load user reports for scoping
      try {
        const repRes = await api.reports.list();
        if (repRes.success && repRes.data?.reports) {
          setReports(repRes.data.reports);
        }
      } catch (e) {
        console.warn('Reports load failed:', e);
      }

      // 2. Load conversations
      const convRes = await api.assistant.listConversations();
      if (convRes.success && convRes.data?.conversations) {
        const convList = convRes.data.conversations;
        setConversations(convList);

        if (convList.length > 0) {
          const firstId = convList[0].id;
          setActiveConvId(firstId);
          await loadMessages(firstId);
        } else {
          // Auto create first consultation session
          await createInitialChat();
        }
      } else {
        await createInitialChat();
      }
    } catch (err) {
      console.error('Failed to initialize assistant:', err);
      setError(err.message || 'Unable to connect to the assistant service. Please verify server connection.');
    } finally {
      setLoadingConv(false);
    }
  };

  const createInitialChat = async () => {
    try {
      const res = await api.assistant.createConversation('Clinical Consultation', selectedReportId || null);
      if (res.success && res.data?.conversation) {
        const newConv = res.data.conversation;
        setConversations([newConv]);
        setActiveConvId(newConv.id);
        setMessages([]);
      }
    } catch (e) {
      console.warn('Could not auto-create conversation:', e);
    }
  };

  const loadMessages = async (convId) => {
    if (!convId) return;
    try {
      setError('');
      const res = await api.assistant.getMessages(convId);
      if (res.success && res.data) {
        setMessages(res.data.messages || []);
        if (res.data.conversation?.report_id) {
          setSelectedReportId(res.data.conversation.report_id);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Failed to load messages for this conversation.');
    }
  };

  const handleSelectConversation = async (convId) => {
    if (convId === activeConvId) return;
    setActiveConvId(convId);
    await loadMessages(convId);
  };

  const handleNewChat = async () => {
    try {
      setError('');
      setLoading(false);
      const title = 'Clinical Consultation';
      const res = await api.assistant.createConversation(title, selectedReportId || null);
      if (res.success && res.data?.conversation) {
        const newConv = res.data.conversation;
        setConversations(prev => [newConv, ...prev.filter(c => c.id !== newConv.id)]);
        setActiveConvId(newConv.id);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize a new consultation session.');
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.assistant.deleteConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (activeConvId === convId) {
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
          loadMessages(remaining[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to delete conversation.');
    }
  };

  const handleSendMessage = async (customText) => {
    const textToSend = (customText !== undefined ? customText : inputMessage).trim();
    if (!textToSend || loading) return;

    setInputMessage('');
    setError('');
    setLastFailedMessage(null);

    // Optimistic UI push
    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      sender_role: 'user',
      message_text: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      // If no active conversation, pass null so backend creates one automatically
      const res = await api.assistant.sendMessage(activeConvId, textToSend, selectedReportId || null);

      if (res.success && res.data?.message) {
        // Sync activeConvId if backend created or resolved a new conversation
        if (res.data.conversation_id && res.data.conversation_id !== activeConvId) {
          setActiveConvId(res.data.conversation_id);
          // Add to conversation list if not present
          setConversations(prev => {
            if (prev.some(c => c.id === res.data.conversation_id)) return prev;
            return [{
              id: res.data.conversation_id,
              title: res.data.conversation_title || textToSend.slice(0, 30),
              created_at: new Date().toISOString()
            }, ...prev];
          });
        }
        setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, res.data.message]);
      } else {
        throw new Error(res.error?.message || 'Could not retrieve AI response.');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError(err.message || 'The AI assistant was unable to respond. Please check your connection or retry.');
      setLastFailedMessage(textToSend);
      // Keep optimistic user message in view so user doesn't lose what they typed
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0B192C]">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopHeader onMenuClick={() => setMobileOpen(true)} />

        <div className="flex-1 flex overflow-hidden h-[calc(100vh-4.5rem)]">
          
          {/* Left Conversations Sidebar */}
          {showConvSidebar && (
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-200 z-10">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0B192C] text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm hover:shadow active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>New Consultation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowConvSidebar(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingConv ? (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto text-indigo-500" />
                    <p>Loading consultations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>No prior consultations</p>
                    <button
                      onClick={handleNewChat}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Start a consultation
                    </button>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = conv.id === activeConvId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`
                          group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                          ${isActive 
                            ? 'bg-indigo-50/90 border border-indigo-200 text-[#0B192C] shadow-2xs font-medium' 
                            : 'hover:bg-slate-50 border border-transparent text-slate-600'}
                        `}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className={`text-xs truncate ${isActive ? 'font-semibold text-indigo-950' : 'font-medium'}`}>
                            {conv.title || 'Clinical Consultation'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                            {conv.created_at ? new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-all"
                          title="Delete consultation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Security & Regulatory Footnote */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                HIPAA & SOC 2 aligned workspace
              </div>
            </div>
          )}

          {/* Main Chat Viewport */}
          <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
            
            {/* Top Assistant Control Strip */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
              <div className="flex items-center gap-3">
                {!showConvSidebar && (
                  <button
                    type="button"
                    onClick={() => setShowConvSidebar(true)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mr-1"
                    title="Open consultations"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 hidden sm:inline">Context:</span>
                  <div className="relative">
                    <select
                      value={selectedReportId}
                      onChange={(e) => setSelectedReportId(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[#0B192C] font-medium pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer max-w-[240px] sm:max-w-xs truncate"
                    >
                      <option value="">General Clinical Knowledge (No Report)</option>
                      {reports.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.report_date || 'N/A'})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* System Ready Badge */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Clinical Knowledge Ready</span>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {messages.length === 0 ? (
                <div className="max-w-2xl mx-auto my-6 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#4338CA] text-white mx-auto flex items-center justify-center shadow-md">
                    <MessageSquare className="w-8 h-8 text-teal-200" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#0B192C] tracking-tight">
                      MedScan Clinical Assistant
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                      Ask questions about diagnostic biomarkers, interpret laboratory reference ranges, and generate structured talking points for your doctor.
                    </p>
                  </div>

                  {selectedReport && (
                    <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 inline-flex items-center gap-2 max-w-md shadow-2xs text-left">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Currently contextualized with: <strong>{selectedReport.title}</strong></span>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Select a topic to start your consultation:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(q)}
                          className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium hover:border-indigo-500 hover:text-indigo-950 hover:bg-indigo-50/40 hover:shadow-sm transition-all text-left shadow-2xs group flex items-start gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.sender_role === 'user';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex items-start gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                        isUser 
                          ? 'bg-[#0B192C] text-white' 
                          : 'bg-gradient-to-br from-[#1E3E62] to-[#4338CA] text-white'
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-1 max-w-[85%]">
                        <div
                          className={`
                            rounded-2xl p-4 sm:p-5 text-xs sm:text-sm shadow-xs transition-all leading-relaxed
                            ${isUser 
                              ? 'bg-[#0B192C] text-white rounded-tr-xs' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'}
                          `}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-line leading-relaxed font-medium">{msg.message_text}</p>
                          ) : (
                            <FormattedMessage text={msg.message_text} />
                          )}

                          {/* Sources */}
                          {!isUser && msg.supporting_sources && msg.supporting_sources.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Verified References:</span>
                              {msg.supporting_sources.map((s, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-indigo-700 hover:text-indigo-900 font-medium hover:underline text-[11px]"
                                >
                                  <span>{s.title}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className={`text-[10px] text-slate-400 px-1 tabular-nums ${isUser ? 'text-right' : 'text-left'}`}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing / Thinking Indicator */}
              {loading && (
                <div className="flex items-start gap-3.5 max-w-3xl mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E3E62] to-[#4338CA] text-white flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-3">
                    <span className="text-xs text-slate-700 font-semibold">MedScan Clinical Assistant is analyzing</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Notice & Retry */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5 max-w-xl">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-900">Assistant Response Error</p>
                      <p className="text-rose-700 mt-0.5 leading-relaxed">{error}</p>
                    </div>
                  </div>
                  {lastFailedMessage && (
                    <button
                      type="button"
                      onClick={() => handleSendMessage(lastFailedMessage)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-rose-800 font-semibold text-xs hover:bg-rose-100/60 transition-colors shrink-0 shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Question</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggested Chips (When messages present) */}
            {messages.length > 0 && (
              <div className="px-4 sm:px-6 py-2 bg-white/90 border-t border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Suggested follow-ups:</span>
                {suggestedQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    disabled={loading}
                    className="px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] text-slate-600 font-medium transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Box */}
            <div className="p-4 sm:p-6 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center bg-[#F8FAFC] border border-slate-300 rounded-2xl focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all shadow-xs"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask any question regarding your lab values, medical terms, or report metrics... (Enter to send)"
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-transparent text-xs sm:text-sm text-[#0B192C] placeholder-slate-400 resize-none focus:outline-none max-h-32 leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="mr-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#4338CA] text-white hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                <span>Informational AI guidance grounded in clinical literature. Not a clinical diagnosis.</span>
                <span className="hidden sm:inline">Press Shift + Enter for new line</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
