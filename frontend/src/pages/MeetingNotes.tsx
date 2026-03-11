import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  User,
  Users,
  Briefcase,
  Tag,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  Download,
  Copy,
  Share2,
  Edit3,
  Trash2,
  MoreHorizontal,
  Mic,
  Video,
  Phone,
  Mail,
  Target,
  TrendingUp,
  Zap,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  Save,
  RefreshCw,
  Bot,
  Brain,
  Lightbulb,
  ArrowRight,
  X,
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../components/ui/alert';
import { useAuth } from '../hooks/useAuth';
import { aiApi, leadsApi, interactionsApi, tasksApi } from '../lib/api';
import { formatDate, formatRelativeTime, getInitials } from '../lib/utils';

interface MeetingSummary {
  overview: string;
  keyConcerns: string[];
  positiveSignals: string[];
  nextAction: string | string[];
  dealHealth: 'Positive' | 'Neutral' | 'Negative';
  actionItems?: {
    task: string;
    assignee?: string;
    dueDate?: string;
  }[];
  decisions?: string[];
  questions?: string[];
}

interface MeetingNote {
  _id: string;
  leadId: string;
  leadName: string;
  leadCompany: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  type: 'discovery' | 'demo' | 'follow-up' | 'negotiation' | 'review';
  notes: string;
  summary?: MeetingSummary;
  recording?: string;
  transcript?: string;
  actionItems?: any[];
  createdAt: string;
  sentiment?: string;
}

const MeetingNotes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('new');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [meetingType, setMeetingType] = useState('discovery');
  const [participants, setParticipants] = useState('');
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    concerns: true,
    signals: true,
    actions: true,
    decisions: true,
  });

  // Fetch leads for selection
  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'meetings'],
    queryFn: async () => {
      try {
        const { data } = await leadsApi.getLeads({ limit: 20 });
        return data;
      } catch (error) {
        console.error('Failed to fetch leads:', error);
        return { leads: [] };
      }
    },
  });

  // Fetch recent meetings from interactions API
  const { data: meetingsData, refetch: refetchMeetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ['meetings', 'recent'],
    queryFn: async () => {
      try {
        const { data } = await interactionsApi.getInteractions({ type: 'Meeting', limit: 10 });
        return data;
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
        return { interactions: [] };
      }
    },
  });

  // AI Summarize Meeting Mutation
  const summarizeMutation = useMutation({
    mutationFn: (data: any) => aiApi.summarizeMeeting(data),
    onSuccess: (data) => {
      setSummary(data.data.summary);
      setIsSummarizing(false);
    },
    onError: () => {
      setIsSummarizing(false);
    },
  });

  // Save Meeting Note Mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => interactionsApi.createInteraction(data),
    onSuccess: () => {
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      resetForm();
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  // Create Task from Action Item
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const leads = leadsData?.leads || [];
  const meetings = meetingsData?.interactions || [];

  // Calculate real analytics
  const totalMeetings = meetings.length;
  const avgDuration = meetings.length > 0
    ? Math.round(meetings.reduce((sum: any, m: any) => sum + (m.duration || 0), 0) / meetings.length)
    : 0;
  const positiveRate = meetings.length > 0
    ? Math.round((meetings.filter((m: any) => m.sentiment === "Positive").length / meetings.length) * 100)
    : 0;
  const totalActions = meetings.reduce(
    (sum: any, m: any) => sum + (m.metadata?.summary?.nextAction?.length || 0),
    0
  );

  // AI Meeting Score
  const getMeetingScore = () => {
    if (!summary) return 0;
    let score = 70;
    if (summary.positiveSignals?.length) score += 10;
    if (summary.nextAction) score += 10;
    if (summary.dealHealth === "Positive") score += 10;
    return Math.min(score, 100);
  };

  const handleLeadSelect = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadSelector(false);
    setMeetingTitle(`Meeting with ${lead.name} - ${lead.company}`);
  };

  const handleSummarize = async () => {
    if (!notes.trim() || notes.length < 50) {
      return;
    }

    setIsSummarizing(true);

    try {
      await summarizeMutation.mutateAsync({
        notes,
        leadName: selectedLead?.name,
        company: selectedLead?.company,
        industry: selectedLead?.industry,
        leadScore: selectedLead?.leadScore,
        dealValue: selectedLead?.value,
        stage: selectedLead?.status,
        meetingType,
        leadId: selectedLead?._id,
      });
    } catch (error) {
      console.error('Failed to summarize meeting:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedLead || !notes.trim() || !meetingTitle) {
      return;
    }

    setIsSaving(true);

    try {
      await saveMutation.mutateAsync({
        leadId: selectedLead._id,
        type: 'Meeting',
        title: meetingTitle,
        notes,
        aiSummary: summary?.overview,
        sentiment: summary?.dealHealth === 'Positive' ? 'Positive' : 
                   summary?.dealHealth === 'Negative' ? 'Negative' : 'Neutral',
        duration: meetingDuration,
        metadata: {
          summary,
          participants: participants.split(',').map((p: string) => p.trim()).filter(Boolean),
          meetingType,
          meetingDate,
        },
      });
    } catch (error) {
      console.error('Failed to save meeting:', error);
    }
  };

  const handleCreateTask = (action: string) => {
    if (!selectedLead) return;
    
    createTaskMutation.mutate({
      title: action,
      leadId: selectedLead._id,
      description: `Created from meeting: ${meetingTitle}`,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'Medium',
      status: 'pending',
    });
  };

  const resetForm = () => {
    setSelectedLead(null);
    setNotes('');
    setSummary(null);
    setMeetingTitle('');
    setMeetingDate(new Date().toISOString().split('T')[0]);
    setMeetingDuration(30);
    setMeetingType('discovery');
    setParticipants('');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'discovery':
        return <Target className="w-4 h-4" />;
      case 'demo':
        return <Video className="w-4 h-4" />;
      case 'follow-up':
        return <Mail className="w-4 h-4" />;
      case 'negotiation':
        return <Briefcase className="w-4 h-4" />;
      case 'review':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Positive':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Neutral':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Negative':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'Positive':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Neutral':
        return <AlertCircle className="w-4 h-4" />;
      case 'Negative':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meeting Notes</h1>
          <p className="text-muted-foreground mt-1">
            Convert conversations into actionable insights with AI
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white animate-pulse-slow">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered Summaries
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">New Meeting</TabsTrigger>
          <TabsTrigger value="recent">Recent Meetings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="lg:sticky lg:top-24 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-500" />
                  Meeting Details
                </CardTitle>
                <CardDescription>
                  Enter meeting information for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lead Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Lead *</label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setShowLeadSelector(!showLeadSelector)}
                    >
                      {selectedLead ? (
                        <div className="flex items-center">
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarFallback className="bg-primary-100 text-primary-600 text-xs">
                              {getInitials(selectedLead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedLead.name} from {selectedLead.company}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Choose a lead...</span>
                      )}
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    <AnimatePresence>
                      {showLeadSelector && leads.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {leads.map((lead: any) => (
                            <button
                              key={lead._id}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-muted transition-colors"
                              onClick={() => handleLeadSelect(lead)}
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
                              <Badge variant="outline" size="sm">
                                {lead.industry}
                              </Badge>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Meeting Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meeting Title *</label>
                  <Input
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g. Discovery Call with Sarah Chen"
                  />
                </div>

                {/* Date and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (min)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={meetingDuration}
                        onChange={(e) => setMeetingDuration(parseInt(e.target.value))}
                        className="pl-10"
                        min="1"
                        max="480"
                      />
                    </div>
                  </div>
                </div>

                {/* Meeting Type and Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meeting Type</label>
                    <Select value={meetingType} onValueChange={setMeetingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discovery">Discovery Call</SelectItem>
                        <SelectItem value="demo">Product Demo</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="review">Quarterly Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Participants</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={participants}
                        onChange={(e) => setParticipants(e.target.value)}
                        placeholder="John, Sarah, Mike"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Meeting Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meeting Notes/Transcript *</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Paste your meeting notes or transcript here..."
                  />
                  {notes && notes.length < 50 && (
                    <p className="text-xs text-yellow-600 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Add at least 50 characters for better AI analysis
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Clear
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSummarize}
                    disabled={!notes.trim() || notes.length < 50 || isSummarizing}
                  >
                    {isSummarizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Summarize
                      </>
                    )}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-400"
                    onClick={handleSave}
                    disabled={!selectedLead || !notes.trim() || !meetingTitle || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Panel */}
            <Card className="min-h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-primary-500" />
                    AI Intelligence
                  </div>
                  {summary && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700">
                        AI Score {getMeetingScore()}%
                      </Badge>
                      <Badge className={getHealthColor(summary.dealHealth)}>
                        {getHealthIcon(summary.dealHealth)}
                        <span className="ml-1">{summary.dealHealth} Deal</span>
                      </Badge>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-powered insights and action items
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
                {isSummarizing ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary-600 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-primary-600 animate-pulse">
                      Analyzing meeting notes...
                    </p>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      Extracting key insights, concerns, and action items
                    </p>
                  </div>
                ) : summary ? (
                  <div className="space-y-6">
                    {/* Executive Overview */}
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleSection('overview')}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <h3 className="text-sm font-semibold flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-primary-500" />
                          Executive Overview
                        </h3>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.overview ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedSections.overview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                              {summary.overview}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Key Concerns */}
                    {summary.keyConcerns && summary.keyConcerns.length > 0 && (
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleSection('concerns')}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-sm font-semibold flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                            Key Concerns ({summary.keyConcerns.length})
                          </h3>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              expandedSections.concerns ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedSections.concerns && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-2"
                            >
                              {summary.keyConcerns.map((concern, index) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg"
                                >
                                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                  <p className="text-sm text-red-700">{concern}</p>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Positive Signals */}
                    {summary.positiveSignals && summary.positiveSignals.length > 0 && (
                      <div className="space-y-2">
                        <button
                          onClick={() => toggleSection('signals')}
                          className="flex items-center justify-between w-full text-left"
                        >
                          <h3 className="text-sm font-semibold flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                            Positive Signals ({summary.positiveSignals.length})
                          </h3>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              expandedSections.signals ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedSections.signals && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-2"
                            >
                              {summary.positiveSignals.map((signal, index) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                  <p className="text-sm text-green-700">{signal}</p>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Next Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleSection('actions')}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <h3 className="text-sm font-semibold flex items-center">
                          <Target className="w-4 h-4 mr-2 text-primary-500" />
                          Next Actions
                        </h3>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            expandedSections.actions ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedSections.actions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-2"
                          >
                            {Array.isArray(summary.nextAction) ? (
                              summary.nextAction.map((action, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-primary-50 rounded-lg group"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center">
                                      <span className="text-xs font-bold text-primary-700">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <p className="text-sm text-primary-700">{action}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 opacity-0 group-hover:opacity-100"
                                    onClick={() => handleCreateTask(action)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Task
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg group">
                                <div className="flex items-center space-x-3">
                                  <div className="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-700">1</span>
                                  </div>
                                  <p className="text-sm text-primary-700">{summary.nextAction}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 opacity-0 group-hover:opacity-100"
                                  onClick={() => handleCreateTask(summary.nextAction as string)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Task
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* AI Recommendations */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-lg p-4 text-white">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="w-5 h-5" />
                        <h3 className="font-semibold">AI Recommendations</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-white/90">
                        <li className="flex items-start space-x-2">
                          <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Schedule follow-up within 48 hours to maintain momentum</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Prepare technical documentation for next meeting</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Connect with decision-maker before next call</span>
                        </li>
                      </ul>

                      {/* Quick Actions */}
                      <div className="flex gap-2 flex-wrap mt-4">
                        <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                          Draft Follow-up Email
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                          Create Proposal
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                          Schedule Next Meeting
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0">
                          Update Lead Stage
                        </Button>
                      </div>

                      {/* Timeline */}
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs font-medium mb-2">Meeting Timeline</p>
                        <div className="space-y-1 text-xs text-white/80">
                          <p>• Meeting created {formatRelativeTime(new Date().toISOString())}</p>
                          <p>• AI analysis generated</p>
                          <p>• Action items extracted</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <Brain className="w-10 h-10 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Waiting for Input</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Enter your meeting notes and click summarize to get AI-powered insights, action items, and deal health analysis.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meetings</CardTitle>
              <CardDescription>
                View and manage your past meeting notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meetingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No meetings found. Create your first meeting to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting: any, index: number) => (
                    <motion.div
                      key={meeting._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedNote({
                          _id: meeting._id,
                          leadId: meeting.leadId,
                          leadName: meeting.lead?.name || 'Unknown',
                          leadCompany: meeting.lead?.company || 'Unknown',
                          title: meeting.title || 'Untitled Meeting',
                          date: meeting.createdAt,
                          duration: meeting.duration || 30,
                          participants: meeting.metadata?.participants || [],
                          type: meeting.metadata?.meetingType || 'discovery',
                          notes: meeting.notes || '',
                          summary: meeting.metadata?.summary,
                          createdAt: meeting.createdAt,
                        });
                        setIsDetailsOpen(true);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          {getMeetingTypeIcon(meeting.metadata?.meetingType || 'discovery')}
                        </div>
                        <div>
                          <p className="font-medium">{meeting.title || 'Untitled Meeting'}</p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.lead?.name || 'Unknown'} • {formatDate(meeting.createdAt)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" size="sm">
                              {meeting.duration || 30} min
                            </Badge>
                            {meeting.sentiment && (
                              <Badge className={
                                meeting.sentiment === 'Positive' ? 'bg-green-50 text-green-700' :
                                meeting.sentiment === 'Negative' ? 'bg-red-50 text-red-700' :
                                'bg-yellow-50 text-yellow-700'
                              }>
                                {meeting.sentiment}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Discovery Call', 'Product Demo', 'Quarterly Review', 'Negotiation', 'Follow-up', 'Kickoff'].map((template, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{template} Template</CardTitle>
                    <CardDescription>
                      Structured template for {template.toLowerCase()} meetings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Pre-filled sections
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        AI-optimized questions
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Action item tracking
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Meetings</p>
                    <p className="text-2xl font-bold">{totalMeetings}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="text-2xl font-bold">{avgDuration} min</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Positive Rate</p>
                    <p className="text-2xl font-bold">{positiveRate}%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Action Items</p>
                    <p className="text-2xl font-bold">{totalActions}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Insights</CardTitle>
              <CardDescription>
                AI-powered trends and patterns from your meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium">Best meeting time</p>
                      <p className="text-sm text-muted-foreground">Tuesdays at 10:00 AM have highest positive rate</p>
                    </div>
                  </div>
                  <Badge>+32%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Most effective type</p>
                      <p className="text-sm text-muted-foreground">Product demos lead to 45% more closed deals</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Top Performer</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Meeting Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedNote && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    {getMeetingTypeIcon(selectedNote.type)}
                  </div>
                  <div>
                    <span>{selectedNote.title}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedNote.leadName} • {selectedNote.leadCompany}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Meeting Metadata */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{formatDate(selectedNote.date)}</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{selectedNote.duration} min</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">{selectedNote.participants?.length || 0} attendees</p>
                  </div>
                </div>

                {/* Participants */}
                {selectedNote.participants && selectedNote.participants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNote.participants.map((p, i) => (
                        <Badge key={i} variant="secondary">
                          <User className="w-3 h-3 mr-1" />
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Summary */}
                {selectedNote.summary && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center">
                      <Brain className="w-4 h-4 mr-2 text-primary-500" />
                      AI Summary
                    </h4>
                    
                    {/* Deal Health */}
                    <Badge className={getHealthColor(selectedNote.summary.dealHealth)}>
                      {getHealthIcon(selectedNote.summary.dealHealth)}
                      <span className="ml-1">{selectedNote.summary.dealHealth} Deal</span>
                    </Badge>

                    {/* Overview */}
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedNote.summary.overview}
                    </p>

                    {/* Key Concerns */}
                    {selectedNote.summary.keyConcerns && selectedNote.summary.keyConcerns.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-red-600">Key Concerns</p>
                        {selectedNote.summary.keyConcerns.map((concern, i) => (
                          <div key={i} className="flex items-start space-x-2 text-sm">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span>{concern}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Next Actions */}
                    {selectedNote.summary.nextAction && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-primary-600">Next Actions</p>
                        <div className="space-y-2">
                          {Array.isArray(selectedNote.summary.nextAction) ? (
                            selectedNote.summary.nextAction.map((action, i) => (
                              <div key={i} className="flex items-center space-x-2 text-sm bg-primary-50 p-2 rounded">
                                <Target className="w-4 h-4 text-primary-600" />
                                <span>{action}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center space-x-2 text-sm bg-primary-50 p-2 rounded">
                              <Target className="w-4 h-4 text-primary-600" />
                              <span>{selectedNote.summary.nextAction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Original Notes */}
                {selectedNote.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Original Notes</h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedNote.notes}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default MeetingNotes;