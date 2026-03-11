import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  User,
  Building2,
  Calendar,
  Layout,
  CheckCircle2,
  X,
  Plus,
  Edit3,
  Copy,
  Share2,
  Mail,
  Send,
  Save,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Target,
  TrendingUp,
  Clock,
  Users,
  Briefcase,
  Tag,
  Settings2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Star,
  ThumbsUp,
  AlertCircle,
  HelpCircle,
  FileSignature,
  Award,
  Zap,
  Brain,
  Lightbulb,
  ArrowRight,
  Check,
  PrinterIcon,
  Image,
  Link,
  Globe,
  Phone,
  Mail as MailIcon,
  MessageSquare,
  XCircle,
  History,
  GitBranch,
  BarChart3,
  PieChart,
  LineChart,
  Activity
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
  DialogTrigger,
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
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../hooks/useAuth';
import { aiApi, leadsApi } from '../lib/api';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '../lib/utils';

interface ProposalSection {
  title: string;
  content: string;
  icon?: any;
}

interface Proposal {
  id?: string;
  title: string;
  executiveSummary: string;
  sections: ProposalSection[];
  pricing: string;
  nextSteps: string;
  timeline?: string;
  validUntil: string;
  preparedFor: string;
  company: string;
  preparedBy: string;
  date: string;
  version?: string;
  status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';
  views?: number;
  downloads?: number;
  shares?: number;
  engagement?: number;
  aiScore?: number;
  leadId?: string;
  leadValue?: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'enterprise' | 'startup' | 'custom';
  thumbnail?: string;
  usageCount: number;
  successRate: number;
}

interface SavedProposal {
  id: string;
  title: string;
  company: string;
  date: string;
  status: string;
  value: number;
  version?: string;
  views?: number;
  downloads?: number;
  engagement?: number;
}

const ProposalGenerator = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('create');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [focusPoints, setFocusPoints] = useState<string[]>([
    'Value Proposition',
    'ROI Analysis',
    'Implementation Timeline',
  ]);
  const [newFocusPoint, setNewFocusPoint] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<SavedProposal | null>(null);
  const [showProposalDetails, setShowProposalDetails] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [version, setVersion] = useState(1);
  const proposalRef = useRef<HTMLDivElement>(null);

  // Fetch leads for selection
  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'proposals'],
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

  // Fetch saved proposals
  const { data: proposalsData, refetch: refetchProposals } = useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      try {
        // Replace with your actual API endpoint
        const { data } = await aiApi.getProposals?.() || { data: { proposals: [] } };
        return data;
      } catch (error) {
        console.error('Failed to fetch proposals:', error);
        return { proposals: [] };
      }
    },
  });

  // AI Generate Proposal Mutation
  const generateProposalMutation = useMutation({
    mutationFn: (data: any) => aiApi.generateProposal(data),
    onSuccess: (data) => {
      const newProposal = {
        ...data.data.proposal,
        version: `v${version}.0`,
        aiScore: calculateAIScore(data.data.proposal),
        id: Date.now().toString(),
      };
      setProposal(newProposal);
      setIsGenerating(false);
      setVersion(prev => prev + 1);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  // Save Proposal Mutation
  const saveProposalMutation = useMutation({
    mutationFn: (data: any) => aiApi.saveProposal?.(data) || Promise.resolve({ data }),
    onSuccess: () => {
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  // Update Proposal Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      aiApi.updateProposalStatus?.(id, status) || Promise.resolve({}),
  });

  const leads = leadsData?.leads || [];
  const savedProposals: SavedProposal[] = proposalsData?.proposals || [];

  // Calculate real analytics
  const sentCount = savedProposals.length;
  const acceptedCount = savedProposals.filter(p => p.status === 'accepted').length;
  const winRate = sentCount > 0 ? Math.round((acceptedCount / sentCount) * 100) : 0;
  const avgDeal = sentCount > 0
    ? savedProposals.reduce((sum, p) => sum + p.value, 0) / sentCount
    : 0;

  const templates: Template[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, modern design for enterprise clients',
      category: 'enterprise',
      usageCount: 1245,
      successRate: 78,
    },
    {
      id: 'startup',
      name: 'Startup',
      description: 'Bold, energetic design for innovative companies',
      category: 'startup',
      usageCount: 892,
      successRate: 82,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Formal, comprehensive layout for large organizations',
      category: 'enterprise',
      usageCount: 567,
      successRate: 74,
    },
    {
      id: 'consulting',
      name: 'Consulting',
      description: 'Strategic focus with executive summary emphasis',
      category: 'standard',
      usageCount: 345,
      successRate: 71,
    },
  ];

  // Calculate AI Score for proposal
  const calculateAIScore = (prop: any) => {
    let score = 70;
    if (prop.sections?.length > 3) score += 10;
    if (prop.executiveSummary?.length > 200) score += 10;
    if (focusPoints.length > 2) score += 5;
    if (selectedLead?.value > 50000) score += 5;
    return Math.min(score, 100);
  };

  // Calculate engagement score
  const calculateEngagement = (proposal: SavedProposal) => {
    return (
      (proposal.views || 0) * 5 +
      (proposal.downloads || 0) * 10 +
      (savedProposals.filter(p => p.id === proposal.id).length) * 8
    );
  };

  const handleLeadSelect = (lead: any) => {
    setSelectedLead(lead);
    setShowLeadSelector(false);
  };

  const handleGenerate = async () => {
    if (!selectedLead) return;

    setIsGenerating(true);

    try {
      await generateProposalMutation.mutateAsync({
        leadId: selectedLead._id,
        template: selectedTemplate,
        focusPoints,
      });
    } catch (error) {
      console.error('Failed to generate proposal:', error);
    }
  };

  const handleSave = async () => {
    if (!proposal || !selectedLead) return;

    setIsSaving(true);

    try {
      await saveProposalMutation.mutateAsync({
        leadId: selectedLead._id,
        title: proposal.title,
        company: proposal.company,
        value: selectedLead.value,
        status: 'draft',
        proposal,
        version: proposal.version,
        aiScore: proposal.aiScore,
      });
    } catch (error) {
      console.error('Failed to save proposal:', error);
    }
  };

  const handleSend = async () => {
    if (!proposal || !selectedLead) return;

    await saveProposalMutation.mutateAsync({
      leadId: selectedLead._id,
      title: proposal.title,
      company: proposal.company,
      value: selectedLead.value,
      status: 'sent',
      proposal,
      version: proposal.version,
      aiScore: proposal.aiScore,
    });

    // Simulate sending email
    console.log('Proposal sent to client');
  };

  const handleExport = () => {
    if (!proposalRef.current) return;

    const element = proposalRef.current;
    
    html2pdf()
      .from(element)
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${proposal?.title || 'proposal'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      })
      .save();
  };

  const handleCopy = () => {
    if (!proposal) return;
    
    const text = `${proposal.title}\n\n${proposal.executiveSummary}`;
    navigator.clipboard.writeText(text);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateStatusMutation.mutateAsync({ id, status });
    queryClient.invalidateQueries({ queryKey: ['proposals'] });
  };

  const handleAddFocusPoint = () => {
    if (newFocusPoint.trim()) {
      setFocusPoints([...focusPoints, newFocusPoint.trim()]);
      setNewFocusPoint('');
    }
  };

  const handleRemoveFocusPoint = (index: number) => {
    setFocusPoints(focusPoints.filter((_, i) => i !== index));
  };

  const handleEditSection = (index: number) => {
    if (proposal) {
      setEditingSection(index);
      setEditContent(proposal.sections[index].content);
    }
  };

  const handleSaveEdit = () => {
    if (proposal && editingSection !== null) {
      const updatedSections = [...proposal.sections];
      updatedSections[editingSection].content = editContent;
      setProposal({ ...proposal, sections: updatedSections, version: `v${version}.0` });
      setEditingSection(null);
      setVersion(prev => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Mail className="w-4 h-4" />;
      case 'viewed':
        return <Eye className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proposal Generator</h1>
          <p className="text-muted-foreground mt-1">
            Create professional, data-driven proposals in minutes with AI
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white animate-pulse-slow">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="saved">Saved Proposals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Configuration Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Lead Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <User className="w-4 h-4 mr-2 text-primary-500" />
                    Select Lead
                  </CardTitle>
                </CardHeader>
                <CardContent>
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

                  {selectedLead && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{selectedLead.company}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="font-medium">{selectedLead.industry}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deal Value:</span>
                        <span className="font-medium">{formatCurrency(selectedLead.value || 0)}</span>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Layout className="w-4 h-4 mr-2 text-primary-500" />
                    Select Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        className={`w-full p-3 rounded-lg border transition-all ${
                          selectedTemplate === template.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-border hover:border-primary-200 hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg ${
                              selectedTemplate === template.id
                                ? 'bg-primary-600'
                                : 'bg-muted'
                            } flex items-center justify-center`}>
                              <FileText className={`w-4 h-4 ${
                                selectedTemplate === template.id
                                  ? 'text-white'
                                  : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                          {selectedTemplate === template.id && (
                            <CheckCircle2 className="w-4 h-4 text-primary-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Focus Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <Target className="w-4 h-4 mr-2 text-primary-500" />
                    Focus Points
                  </CardTitle>
                  <CardDescription>
                    Key areas to emphasize in the proposal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {focusPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg group"
                      >
                        <span className="text-sm">{point}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveFocusPoint(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      value={newFocusPoint}
                      onChange={(e) => setNewFocusPoint(e.target.value)}
                      placeholder="Add focus point..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFocusPoint()}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddFocusPoint}
                      disabled={!newFocusPoint.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                className="w-full bg-gradient-to-r from-primary-600 to-primary-400 h-12"
                onClick={handleGenerate}
                disabled={!selectedLead || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Proposal...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Proposal
                  </>
                )}
              </Button>

              {/* AI Insights */}
              <Card className="bg-gradient-to-br from-primary-600 to-primary-400 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4" />
                    <h4 className="text-sm font-semibold">AI Insights</h4>
                  </div>
                  <p className="text-xs text-white/90 mb-3">
                    Based on {selectedLead?.company || 'the lead'}'s industry and interactions, 
                    we recommend emphasizing ROI and implementation timeline.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-white/80">
                    <Lightbulb className="w-3 h-3" />
                    <span>Industry-specific case studies available</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Proposal Preview */}
            <div className="lg:col-span-8">
              <Card className="min-h-[800px] flex flex-col">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary-500" />
                        Proposal Preview
                      </CardTitle>
                      {proposal && (
                        <Badge variant="outline" className="ml-2">
                          {proposal.version}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {proposal && (
                        <>
                          <Badge className="bg-green-100 text-green-700">
                            AI Score {proposal.aiScore}%
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                          >
                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </>
                      )}
                      <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="docx">Word</SelectItem>
                          <SelectItem value="txt">Text</SelectItem>
                        </SelectContent>
                      </Select>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <PrinterIcon className="w-4 h-4 mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleCopy}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Summary
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleSend}>
                            <Send className="w-4 h-4 mr-2" />
                            Send to Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button size="sm" onClick={handleSend} disabled={!proposal}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSave} disabled={!proposal}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                  {isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Brain className="w-6 h-6 text-primary-600 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-primary-600 animate-pulse">
                        Crafting your proposal...
                      </p>
                      <p className="text-sm text-muted-foreground text-center max-w-xs">
                        Analyzing lead data and generating personalized content
                      </p>
                    </div>
                  ) : proposal ? (
                    <motion.div
                      ref={proposalRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`prose prose-sm max-w-none ${!showPreview ? 'blur-sm select-none' : ''}`}
                    >
                      {/* Proposal Header */}
                      <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
                        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                          <span>Prepared for: {proposal.preparedFor}</span>
                          <span>•</span>
                          <span>{proposal.company}</span>
                          <span>•</span>
                          <span>{proposal.date}</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                          <Badge variant="outline">Version {proposal.version}</Badge>
                          <Badge variant="outline">AI Score: {proposal.aiScore}%</Badge>
                        </div>
                      </div>

                      {/* Executive Summary */}
                      <div className="mb-8 p-6 bg-primary-50 rounded-lg">
                        <h2 className="text-lg font-semibold mb-3 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-primary-600" />
                          Executive Summary
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                          {proposal.executiveSummary}
                        </p>
                      </div>

                      {/* Sections */}
                      {proposal.sections.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="mb-6 group relative"
                        >
                          <div className="flex items-start justify-between">
                            <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleEditSection(index)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>

                          {editingSection === index ? (
                            <div className="space-y-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={6}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                              />
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSection(null)}
                                >
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={handleSaveEdit}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {section.content}
                            </p>
                          )}
                        </motion.div>
                      ))}

                      {/* Implementation Timeline */}
                      {proposal.timeline && (
                        <div className="mb-6 p-6 bg-blue-50 rounded-lg">
                          <h2 className="text-lg font-semibold mb-3 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Implementation Timeline
                          </h2>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {proposal.timeline}
                          </p>
                        </div>
                      )}

                      {/* Pricing */}
                      <div className="mb-6 p-6 border border-border rounded-lg">
                        <h2 className="text-lg font-semibold mb-3 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                          Investment
                        </h2>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {proposal.pricing}
                        </p>
                      </div>

                      {/* Next Steps */}
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Next Steps</h2>
                        <p className="text-muted-foreground">{proposal.nextSteps}</p>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 pt-6 border-t border-border flex justify-between text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Valid until:</span> {proposal.validUntil}
                        </div>
                        <div>
                          <span className="font-medium">Prepared by:</span> {proposal.preparedBy}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center">
                        <FileText className="w-10 h-10 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Ready to Create</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Select a lead, choose a template, and click generate to create a professional, 
                          AI-powered proposal tailored to your prospect.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="mb-2">
                        {template.category}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {template.successRate}% success
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{template.usageCount.toLocaleString()} uses</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setActiveTab('create');
                        }}
                      >
                        Use Template
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Proposals</CardTitle>
              <CardDescription>
                Manage and track your sent proposals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedProposals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No proposals yet. Create your first proposal to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {savedProposals.map((proposal, index) => {
                    const engagement = calculateEngagement(proposal);
                    return (
                      <motion.div
                        key={proposal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setShowProposalDetails(true);
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{proposal.title}</p>
                              {proposal.version && (
                                <Badge variant="outline" size="sm">
                                  {proposal.version}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{proposal.company}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(proposal.status)}>
                                {getStatusIcon(proposal.status)}
                                <span className="ml-1 capitalize">{proposal.status}</span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(proposal.date)}
                              </span>
                              {engagement > 0 && (
                                <Badge variant="outline" size="sm">
                                  Engagement: {engagement}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(proposal.value)}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProposal(proposal);
                              setShowProposalDetails(true);
                            }}
                          >
                            View
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Proposals Sent</p>
                    <p className="text-2xl font-bold">{sentCount}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-bold">{winRate}%</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                    <p className="text-2xl font-bold">{formatCurrency(avgDeal)}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(savedProposals.reduce((sum, p) => sum + p.value, 0))}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Template Performance</CardTitle>
              <CardDescription>
                Which templates perform best with clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.successRate}% success</p>
                    </div>
                    <Progress value={template.successRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Win Rate by Industry</CardTitle>
              <CardDescription>
                Proposal success rates across different sectors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Technology', 'Healthcare', 'Finance', 'Manufacturing'].map((industry, i) => {
                  const rate = 60 + Math.floor(Math.random() * 30);
                  return (
                    <div key={industry} className="flex items-center justify-between">
                      <span className="text-sm">{industry}</span>
                      <div className="flex items-center space-x-4 flex-1 ml-4">
                        <Progress value={rate} className="h-2 flex-1" />
                        <span className="text-sm font-medium w-12">{rate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Proposal Details Dialog */}
      <Dialog open={showProposalDetails} onOpenChange={setShowProposalDetails}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedProposal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedProposal.title}
                  {selectedProposal.version && (
                    <Badge variant="outline">{selectedProposal.version}</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Proposal for {selectedProposal.company}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedProposal.status)}>
                      {getStatusIcon(selectedProposal.status)}
                      <span className="ml-1 capitalize">{selectedProposal.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedProposal.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(selectedProposal.date)}</p>
                  </div>
                </div>

                {selectedProposal.engagement !== undefined && (
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Engagement Score</p>
                    <p className="text-2xl font-bold text-primary-600">{selectedProposal.engagement}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline">
                      <Send className="w-4 h-4 mr-2" />
                      Resend
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sent</span>
                      <span>{formatDate(selectedProposal.date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Viewed</span>
                      <span>{selectedProposal.views || 0} times</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Downloads</span>
                      <span>{selectedProposal.downloads || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Update Status</h4>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedProposal.id, 'accepted')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedProposal.id, 'declined')}
                    >
                      <XCircle className="w-4 h-4 mr-2 text-red-600" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowProposalDetails(false)}>
                  Close
                </Button>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Open Proposal
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProposalGenerator;