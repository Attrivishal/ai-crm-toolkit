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

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
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

// Win Probability Calculator
const getWinProbability = (lead: any) => {
  let score = 0;

  // Lead score weight
  score += (lead.leadScore || 0) * 0.5;

  // Deal value weight
  if (lead.value > 50000) score += 20;
  else if (lead.value > 20000) score += 10;

  // Stage weight
  switch (lead.status) {
    case "Qualified":
      score += 10;
      break;
    case "Demo Scheduled":
      score += 20;
      break;
    case "Proposal Sent":
      score += 30;
      break;
    case "Closed Won":
      score = 100;
      break;
    default:
      break;
  }

  return Math.min(Math.round(score), 100);
};

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
        const { data } = await leadsApi.getLeads({ limit: 10 });
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
        const { data } = await tasksApi.getTasks({ limit: 5, status: 'pending' });
        return data;
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return { tasks: [] };
      }
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

  // Add welcome insight when leads load
  useEffect(() => {
    if (leadsData?.leads?.length > 0 && messages.length === 1) {
      const totalLeads = leadsData.leads.length;
      const avgScore = Math.round(
        leadsData.leads.reduce((sum: number, l: any) => sum + (l.leadScore || 0), 0) / totalLeads
      );
      const totalValue = leadsData.leads.reduce((sum: number, l: any) => sum + (l.value || 0), 0);
      const highValueLeads = leadsData.leads.filter((l: any) => l.value > 50000).length;

      const insightMessage: Message = {
        id: 'insight',
        role: 'assistant',
        content: `📊 **Quick CRM Insight**\n\nYou currently have **${totalLeads} leads** in your pipeline worth **${formatCurrency(totalValue)}**.\n\n• Average Lead Score: **${avgScore}**\n• High-Value Deals (>$50k): **${highValueLeads}**\n\nI can help you analyze these leads, draft emails, or identify at-risk deals. What would you like to focus on?`,
        timestamp: new Date(),
        suggestions: [
          "Show me my top opportunities",
          "Analyze high-value leads",
          "Identify at-risk deals",
          "Draft follow-up emails",
        ],
      };

      setMessages(prev => [...prev, insightMessage]);
    }
  }, [leadsData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Process with AI
    setTimeout(async () => {
      try {
        const response = await generateAIResponse(input);
        setMessages(prev => [...prev, response]);
      } catch (error) {
        const fallback: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble processing that request right now. Please try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallback]);
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  const generateAIResponse = async (userInput: string): Promise<Message> => {
    const input = userInput.toLowerCase();
    const leads = leadsData?.leads || [];
    
    // Check for pipeline/top opportunities intent
    if (input.includes('pipeline') || input.includes('top') || input.includes('opportunities')) {
      const sortedLeads = [...leads]
        .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
        .slice(0, 3);
      
      const totalValue = leads.reduce((sum: number, l: any) => sum + (l.value || 0), 0);
      
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `📈 **Pipeline Analysis**\n\nYour pipeline currently has **${leads.length} deals** worth **${formatCurrency(totalValue)}**.\n\n**Top Opportunities:**\n${sortedLeads.map((l: any, i: number) => 
          `${i+1}. **${l.name}** (${l.company}) - ${formatCurrency(l.value)} | Win Probability: **${getWinProbability(l)}%**`
        ).join('\n')}\n\nWould you like me to analyze any specific deal in detail?`,
        timestamp: new Date(),
        suggestions: [
          "Analyze best deal",
          "Show at-risk deals",
          "Draft follow-up emails",
        ],
      };
    }
    
    // Check for at-risk deals
    if (input.includes('risk') || input.includes('at-risk') || input.includes('danger')) {
      const atRiskLeads = leads
        .filter((l: any) => getWinProbability(l) < 40)
        .slice(0, 3);
      
      if (atRiskLeads.length === 0) {
        return {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Good news! I don't see any high-risk deals in your pipeline right now.",
          timestamp: new Date(),
        };
      }
      
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Deals That Need Attention**\n\nThe following deals have a low win probability and may need attention:\n\n${atRiskLeads.map((l: any) => 
          `• **${l.name}** (${l.company}) - ${formatCurrency(l.value)} | Win Probability: **${getWinProbability(l)}%**`
        ).join('\n')}\n\nWould you like me to suggest next steps for these deals?`,
        timestamp: new Date(),
        suggestions: [
          "Suggest next steps",
          "Draft follow-up email",
          "Schedule review meeting",
        ],
      };
    }
    
    // Check for lead analysis
    if (input.includes('analyze') && (input.includes('lead') || input.includes('deal'))) {
      if (selectedLead) {
        return {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `🔍 **Analysis for ${selectedLead.name}**\n\n• Company: ${selectedLead.company}\n• Industry: ${selectedLead.industry}\n• Deal Value: ${formatCurrency(selectedLead.value || 0)}\n• Current Stage: ${selectedLead.status}\n• Lead Score: ${selectedLead.leadScore}\n• Win Probability: **${getWinProbability(selectedLead)}%**\n\nBased on this data, I recommend focusing on moving this deal to the next stage. Would you like me to draft a follow-up email?`,
          timestamp: new Date(),
          actions: [
            { label: "Draft Follow-up Email", type: 'email', data: selectedLead },
            { label: "Create Task", type: 'task' },
          ],
        };
      }
      
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'd be happy to analyze a lead for you. Please select a lead from the dropdown or specify which lead you'd like me to analyze.",
        timestamp: new Date(),
      };
    }
    
    // Check for email generation intent
    if (input.includes('email') || input.includes('draft') || input.includes('write')) {
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I can help you draft a professional email. Which lead would you like to contact?",
        timestamp: new Date(),
        actions: leads?.slice(0, 3).map((lead: any) => ({
          label: `Email ${lead.name} at ${lead.company}`,
          type: 'email',
          data: lead,
        })),
      };
    }
    
    // Check for high-value leads
    if (input.includes('high-value') || input.includes('big deals')) {
      const highValueLeads = leads
        .filter((l: any) => l.value > 50000)
        .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
      
      return {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `💰 **High-Value Opportunities**\n\n${highValueLeads.map((l: any, i: number) => 
          `${i+1}. **${l.name}** (${l.company}) - ${formatCurrency(l.value)} | Win Probability: **${getWinProbability(l)}%**`
        ).join('\n')}`,
        timestamp: new Date(),
      };
    }
    
    // Default response
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: "I understand you need assistance. Here's what I can help you with:\n\n• 📊 **Pipeline Analysis** - Get insights on your deals\n• 🎯 **Lead Analysis** - Deep dive into specific leads\n• 📧 **Email Drafting** - Create personalized outreach emails\n• ⚠️ **Risk Detection** - Identify at-risk deals\n• 📈 **Win Probability** - Predict deal success\n\nWhat would you like me to help with?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my pipeline",
        "Show high-value deals",
        "Identify at-risk deals",
        "Draft an email",
      ],
    };
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
      action: 'Show me pipeline insights',
      color: 'blue',
    },
    {
      id: 'priority',
      title: 'High Priority Leads',
      description: `Top ${Math.min(3, leadsData?.leads?.length || 0)} opportunities`,
      icon: Target,
      action: 'Show high priority leads',
      color: 'green',
    },
    {
      id: 'followup',
      title: 'Follow-ups Needed',
      description: `${tasksData?.tasks?.length || 0} pending tasks`,
      icon: Clock,
      action: 'Show leads needing follow up',
      color: 'purple',
    },
    {
      id: 'risk',
      title: 'Deal Risk',
      description: 'Predict deals that may be lost',
      icon: AlertCircle,
      action: 'Show risky deals',
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
            Your intelligent sales assistant, ready 24/7
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
                    Analyzing CRM data...
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
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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
                        <p className="text-xs font-bold mt-1">
                          Win: {getWinProbability(lead)}%
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-3 text-xs text-center text-muted-foreground">
              <Zap className="w-3 h-3 inline mr-1 text-primary-500" />
              AI-powered insights • Context-aware responses • Real-time CRM data
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
                Quick Actions
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
                Active Context
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
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Value</p>
                      <p className="font-medium">{formatCurrency(selectedLead.value || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Win Prob</p>
                      <p className={`font-medium ${
                        getWinProbability(selectedLead) >= 70 ? 'text-green-600' :
                        getWinProbability(selectedLead) >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {getWinProbability(selectedLead)}%
                      </p>
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
                    Select a lead from the dropdown to get personalized insights
                  </p>
                </div>
              )}

              {/* Recent Tasks */}
              {tasksData?.tasks && tasksData.tasks.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Pending Tasks</p>
                  <div className="space-y-2">
                    {tasksData.tasks.slice(0, 3).map((task: any) => (
                      <div key={task._id} className="flex items-center justify-between text-sm p-2 hover:bg-muted rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{task.title}</span>
                        </div>
                        <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'} size="sm">
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Today's Activity</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">
                      {Math.floor(Math.random() * 5) + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">Meetings</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">
                      {Math.floor(Math.random() * 8) + 2}
                    </p>
                    <p className="text-xs text-muted-foreground">Emails</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">
                      {tasksData?.tasks?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-bold">
                      {formatCurrency(
                        leadsData?.leads?.reduce((sum: number, l: any) => sum + (l.value || 0), 0) || 0
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Pipeline</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-primary-500" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Pipeline Analysis</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lead Analysis</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Email Draft</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
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