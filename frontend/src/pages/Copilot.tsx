import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Zap,
  MessageSquare,
  FileText,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Mic,
  Paperclip,
  Smile,
  MoreHorizontal,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X,
  ChevronRight,
  Briefcase,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react';

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from '../hooks/useAuth';
import { aiApi, leadsApi, tasksApi } from '../lib/api';
import { formatCurrency, formatRelativeTime, getInitials } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: {
    label: string;
    type: 'lead' | 'task' | 'email' | 'meeting';
    data?: any;
  }[];
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: string;
  color: string;
}

const Copilot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your PipelineIQ AI Copilot. I can help you analyze leads, prepare for meetings, draft emails, and optimize your sales strategy. What would you like assistance with today?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my top leads",
        "Draft follow-up emails",
        "Summarize recent meetings",
        "Identify at-risk deals",
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch leads for context
  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'copilot'],
    queryFn: async () => {
      try {
        const { data } = await leadsApi.getLeads({ limit: 50 });
        return data;
      } catch (error) {
        console.error('Failed to fetch leads:', error);
        return { leads: [] };
      }
    },
  });

  // Fetch recent tasks
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'recent'],
    queryFn: async () => {
      try {
        const { data } = await tasksApi.getTasks({ limit: 10, status: 'pending' });
        return data;
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return { tasks: [] };
      }
    },
  });

  // AI Chat Completion Mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { messages: any[]; context: any }) => {
      // Call your AI API endpoint that connects to OpenAI/Claude/Llama
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });

  // AI Generate Email Mutation
  const generateEmailMutation = useMutation({
    mutationFn: (data: any) => aiApi.generateEmail(data),
  });

  // AI Analyze Lead Mutation
  const analyzeLeadMutation = useMutation({
    mutationFn: (data: any) => aiApi.analyzeLead(data),
  });

  // AI Summarize Meeting Mutation
  const summarizeMeetingMutation = useMutation({
    mutationFn: (data: any) => aiApi.summarizeMeeting(data),
  });

  // AI Predict Deal Risk Mutation
  const predictRiskMutation = useMutation({
    mutationFn: (leadId: string) => aiApi.predictDealRisk(leadId),
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare context from CRM data
      const context = {
        user: {
          name: user?.name,
          email: user?.email,
          role: user?.role,
        },
        leads: leadsData?.leads?.map((l: any) => ({
          id: l._id,
          name: l.name,
          company: l.company,
          value: l.value,
          status: l.status,
          leadScore: l.leadScore,
          industry: l.industry,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })) || [],
        tasks: tasksData?.tasks?.map((t: any) => ({
          id: t._id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
        })) || [],
        stats: {
          totalLeads: leadsData?.leads?.length || 0,
          totalValue: leadsData?.leads?.reduce((sum: number, l: any) => sum + (l.value || 0), 0) || 0,
          pendingTasks: tasksData?.tasks?.length || 0,
        },
      };

      // Call AI with conversation history and context
      const response = await chatMutation.mutateAsync({
        messages: messages.concat(userMessage).map(m => ({
          role: m.role,
          content: m.content,
        })),
        context,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions || [],
        actions: response.actions || [],
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to AI services right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleActionClick = async (action: any) => {
    if (action.type === 'email' && action.data) {
      try {
        const response = await generateEmailMutation.mutateAsync({
          leadName: action.data.name,
          company: action.data.company,
          industry: action.data.industry,
          leadId: action.data._id,
        });
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.data.email.body,
          timestamp: new Date(),
          actions: [
            { label: "Copy to Clipboard", type: 'email' },
            { label: "Edit Draft", type: 'email' },
          ],
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Failed to generate email:', error);
      }
    }
  };

  // Dynamic suggestions based on real data
  const suggestions: Suggestion[] = [
    {
      id: 'pipeline',
      title: 'Pipeline Insights',
      description: `Analyze ${leadsData?.leads?.length || 0} active deals`,
      icon: BarChart3,
      action: 'Give me a detailed analysis of my entire sales pipeline',
      color: 'blue',
    },
    {
      id: 'priority',
      title: 'High Priority Leads',
      description: `Top ${Math.min(3, leadsData?.leads?.length || 0)} opportunities`,
      icon: Target,
      action: 'Show me my highest priority leads and recommend next steps',
      color: 'green',
    },
    {
      id: 'followup',
      title: 'Follow-ups Needed',
      description: `${tasksData?.tasks?.length || 0} pending tasks`,
      icon: Clock,
      action: 'What follow-up actions should I take today?',
      color: 'purple',
    },
    {
      id: 'strategy',
      title: 'Sales Strategy',
      description: 'Optimize your approach',
      icon: TrendingUp,
      action: 'Suggest strategies to improve my win rate',
      color: 'orange',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-8rem)] flex flex-col space-y-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Copilot</h1>
          <p className="text-muted-foreground mt-1">
            Your intelligent sales assistant, powered by real-time AI
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white animate-pulse-slow">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Active
        </Badge>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary-50 to-background flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">PipelineIQ Copilot</h2>
                <div className="flex items-center text-xs text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                  Online & Ready
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary-100 text-primary-600 ml-3'
                          : 'bg-gradient-to-br from-primary-600 to-primary-400 text-white mr-3'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div>
                      <div
                        className={`p-4 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white rounded-tr-none'
                            : 'bg-muted/50 text-foreground rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleActionClick(action)}
                            >
                              {action.label}
                              <ChevronRight className="w-3 h-3 ml-auto" />
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <p
                        className={`mt-1 text-[10px] font-medium opacity-50 ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex max-w-[80%] flex-col">
                  <div className="flex flex-row">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center mr-3">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/50 rounded-tl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-11">
                    AI is thinking...
                  </p>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setShowLeadSelector(!showLeadSelector)}
              >
                <Plus className="w-5 h-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask me anything about your sales pipeline..."
                  className="pr-24"
                  disabled={isTyping}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isTyping}>
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isTyping}>
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="shrink-0 bg-gradient-to-r from-primary-600 to-primary-400"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Lead Selector Dropdown */}
            <AnimatePresence>
              {showLeadSelector && leadsData?.leads && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-20 left-4 right-4 bg-card border border-border rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto z-50"
                >
                  <p className="text-xs font-medium text-muted-foreground p-2">Select a lead to discuss</p>
                  {leadsData.leads.map((lead: any) => (
                    <button
                      key={lead._id}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-muted rounded-lg transition-colors"
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowLeadSelector(false);
                        setInput(`Analyze lead: ${lead.name} from ${lead.company}`);
                      }}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white text-xs">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.company}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={lead.leadScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          Score: {lead.leadScore}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-3 text-xs text-center text-muted-foreground">
              <Zap className="w-3 h-3 inline mr-1 text-primary-500" />
              AI-powered by OpenAI • Real-time CRM data • Smart suggestions
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4 hidden lg:block">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Zap className="w-4 h-4 mr-2 text-primary-500" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600',
                  green: 'bg-green-100 text-green-600',
                  purple: 'bg-purple-100 text-purple-600',
                  orange: 'bg-orange-100 text-orange-600',
                }[suggestion.color] || 'bg-gray-100 text-gray-600';
                
                return (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleSuggestionClick(suggestion.action)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${colorClasses}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{suggestion.title}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Context Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-primary-500" />
                CRM Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Lead */}
              {selectedLead ? (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Currently discussing</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white">
                        {getInitials(selectedLead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedLead.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedLead.company}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setSelectedLead(null)}
                  >
                    Clear Context
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No lead selected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI will use all your CRM data for context
                  </p>
                </div>
              )}

              {/* Quick Stats */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Pipeline Summary</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">{leadsData?.leads?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Leads</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">
                      {formatCurrency(
                        leadsData?.leads?.reduce((sum: number, l: any) => sum + (l.value || 0), 0) || 0
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Pipeline Value</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">
                      {leadsData?.leads?.filter((l: any) => l.status === 'Proposal Sent').length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Proposals</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">{tasksData?.tasks?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Pending Tasks</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Copilot;