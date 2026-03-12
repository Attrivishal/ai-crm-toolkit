import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import {
  Mail,
  Send,
  Copy,
  RefreshCw,
  Sparkles,
  ChevronDown,
  User,
  Building2,
  Briefcase,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle,
  Zap,
  Settings2,
  Save,
  Download,
  Share2,
  Edit3,
  Trash2,
  Clock,
  Users,
  Target,
  TrendingUp,
  MessageSquare,
  Paperclip,
  Smile,
  MoreHorizontal,
  Star,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Calendar,
  Bot,
  Sparkles as SparklesIcon
} from 'lucide-react';

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useAuth } from '../hooks/useAuth';
import { aiApi, leadsApi } from '../lib/api';
import { formatCurrency, formatDate, getInitials } from '../lib/utils';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'follow-up' | 'intro' | 'proposal' | 'meeting' | 'thank-you';
  usageCount: number;
  successRate?: number;
}

interface GeneratedEmail {
  subject: string;
  body: string;
  followUp: string;
}

const EmailGenerator = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [formData, setFormData] = useState({
    leadName: '',
    company: '',
    product: 'PipelineIQ Platform',
    tone: 'Professional',
    industry: '',
    senderName: user?.name || '',
    purpose: 'follow-up',
    keyPoints: '',
  });
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showLeadSelector, setShowLeadSelector] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Follow-up after Demo',
      subject: 'Great speaking with you! Next steps for {company}',
      body: 'Hi {name},\n\nIt was great demonstrating PipelineIQ to you today. Based on our conversation, I think we can definitely help {company} achieve your goals...',
      category: 'follow-up',
      usageCount: 24,
      successRate: 78,
    },
    {
      id: '2',
      name: 'Intro to PipelineIQ',
      subject: 'Helping {company} close more deals with AI',
      body: 'Hi {name},\n\nI noticed that {company} is doing amazing things in the {industry} space. I wanted to introduce myself...',
      category: 'intro',
      usageCount: 56,
      successRate: 82,
    },
    {
      id: '3',
      name: 'Proposal Follow-up',
      subject: 'Following up on your proposal',
      body: 'Hi {name},\n\nI wanted to follow up on the proposal I sent last week. Do you have any questions I can answer?',
      category: 'proposal',
      usageCount: 18,
      successRate: 65,
    },
  ]);

  // Fetch leads for selection
  const { data: leadsData } = useQuery({
    queryKey: ['leads', 'email'],
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

  // AI Generate Email Mutation
  const generateEmailMutation = useMutation({
    mutationFn: (data: any) => aiApi.generateEmail(data),
    onSuccess: (data) => {
      setGeneratedEmail(data.data.email);
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    },
  });

  const leads = leadsData?.leads || [];

  // Calculate real analytics from leads data
  const totalEmails = leads.length * 2; // Estimate 2 emails per lead
  const openRate = leads.length > 0
    ? Math.round((leads.filter((l: any) => l.status !== "New Lead").length / leads.length) * 100)
    : 0;
  const replyRate = leads.length > 0
    ? Math.round((leads.filter((l: any) => l.status === "Qualified").length / leads.length) * 100)
    : 0;
  const meetingsBooked = leads.filter((l: any) => l.status === "Demo Scheduled").length;

  // Get unique industries for smart templates
  const uniqueIndustries = [...new Set(leads.map((l: any) => l.industry))].slice(0, 3);

  // AI Email Quality Score
  const getEmailScore = () => {
    if (!generatedEmail) return 0;
    let score = 70;
    if (generatedEmail.body.length > 200) score += 10;
    if (formData.keyPoints) score += 10;
    if (formData.industry) score += 10;
    if (selectedLead?.value > 50000) score += 10;
    return Math.min(score, 100);
  };

  const handleLeadSelect = (lead: any) => {
    setSelectedLead(lead);
    setFormData(prev => ({
      ...prev,
      leadName: lead.name,
      company: lead.company,
      industry: lead.industry,
      purpose: lead.status === "Proposal Sent" 
        ? "follow-up" 
        : lead.status === "Qualified" 
        ? "meeting" 
        : "intro"
    }));
    setShowLeadSelector(false);
  };

  const handleGenerate = async () => {
    if (!formData.leadName || !formData.company) {
      return;
    }

    setIsGenerating(true);
    setFeedback(null);

    try {
      await generateEmailMutation.mutateAsync({
        leadName: formData.leadName,
        company: formData.company,
        product: formData.product,
        tone: formData.tone,
        industry: formData.industry,
        senderName: formData.senderName,
        purpose: formData.purpose,
        keyPoints: formData.keyPoints,
        leadId: selectedLead?._id,
        leadScore: selectedLead?.leadScore,
        dealValue: selectedLead?.value,
        stage: selectedLead?.status
      });
    } catch (error) {
      console.error('Failed to generate email:', error);
    }
  };

  const handleCopy = () => {
    if (generatedEmail) {
      const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'Professional':
        return <Briefcase className="w-4 h-4" />;
      case 'Friendly':
        return <Smile className="w-4 h-4" />;
      case 'Bold':
        return <Zap className="w-4 h-4" />;
      case 'Direct':
        return <Target className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold tracking-tight">Email Generator</h1>
          <p className="text-muted-foreground mt-1">
            Create personalized, high-converting emails with AI
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white animate-pulse-slow">
          <SparklesIcon className="w-3 h-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate Email</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="lg:sticky lg:top-24 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-primary-500" />
                  Email Details
                </CardTitle>
                <CardDescription>
                  Provide the context for your email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lead Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Lead</label>
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
                      <ChevronDown className="w-4 h-4" />
                    </Button>

                    <AnimatePresence>
                      {showLeadSelector && leads && (
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
                              <div className="text-right">
                                <Badge variant="outline" size="sm">
                                  {lead.industry}
                                </Badge>
                                <p className="text-xs mt-1">{lead.status}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lead Name</label>
                    <Input
                      value={formData.leadName}
                      onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                      placeholder="e.g. Sarah Chen"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. TechCorp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product/Service</label>
                    <Input
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      placeholder="e.g. PipelineIQ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tone</label>
                    <Select
                      value={formData.tone}
                      onValueChange={(value) => setFormData({ ...formData, tone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Friendly">Friendly</SelectItem>
                        <SelectItem value="Bold">Bold</SelectItem>
                        <SelectItem value="Direct">Direct</SelectItem>
                        <SelectItem value="Warm">Warm</SelectItem>
                        <SelectItem value="Formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Purpose</label>
                    <Select
                      value={formData.purpose}
                      onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="intro">Introduction</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="meeting">Meeting Request</SelectItem>
                        <SelectItem value="thank-you">Thank You</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sender Name</label>
                  <Input
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Points (Optional)</label>
                  <textarea
                    value={formData.keyPoints}
                    onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Add specific points you want to highlight..."
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-400"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={!formData.leadName || !formData.company || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Email Preview */}
            <Card className="min-h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary-500" />
                    Generated Email
                  </div>
                  {generatedEmail && (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        AI Score {getEmailScore()}%
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="relative"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSave}>
                        {isSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
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
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Discard
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  AI-generated email based on your inputs
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary-600 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-primary-600 animate-pulse">
                      Crafting your email...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Analyzing lead context and personalizing content
                    </p>
                  </div>
                ) : generatedEmail ? (
                  <div className="space-y-6">
                    {/* AI Writing Tools */}
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline">
                        Shorten Email
                      </Button>
                      <Button size="sm" variant="outline">
                        Make More Friendly
                      </Button>
                      <Button size="sm" variant="outline">
                        Add Meeting CTA
                      </Button>
                      <Button size="sm" variant="outline">
                        Improve Subject
                      </Button>
                    </div>

                    {/* Email Preview Header */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary-100 text-primary-600">
                              {getInitials(formData.senderName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{formData.senderName}</p>
                            <p className="text-xs text-muted-foreground">to {formData.leadName}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center">
                          {getToneIcon(formData.tone)}
                          <span className="ml-1">{formData.tone}</span>
                        </Badge>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm font-medium">Subject:</p>
                        <p className="text-sm text-muted-foreground mt-1">{generatedEmail.subject}</p>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="prose prose-sm max-w-none">
                      {generatedEmail.body.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-sm leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Follow-up Suggestion */}
                    {generatedEmail.followUp && (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-4 h-4 text-primary-600" />
                          <p className="text-sm font-semibold text-primary-700">Suggested Follow-up</p>
                        </div>
                        <p className="text-sm text-primary-600">{generatedEmail.followUp}</p>
                      </div>
                    )}

                    {/* Feedback Section */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-muted-foreground">Was this helpful?</p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={feedback === 'positive' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleFeedback('positive')}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Yes
                          </Button>
                          <Button
                            variant={feedback === 'negative' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleFeedback('negative')}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            No
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleGenerate}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <Mail className="w-10 h-10 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Write</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Fill in the lead details and click generate to create a personalized email that gets responses.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dynamic Industry Templates */}
            {uniqueIndustries.map((industry, idx) => (
              <motion.div
                key={`industry-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-primary-200">
                  <CardHeader>
                    <Badge variant="outline" className="mb-2 w-fit bg-primary-50">
                      {industry}
                    </Badge>
                    <CardTitle className="text-base">Intro for {industry}</CardTitle>
                    <CardDescription>
                      Personalized template for {industry} companies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      Hi [Name], I see that [Company] is doing amazing work in the {industry} space...
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Existing Templates */}
            {savedTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="mb-2">
                        {template.category}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Use Template</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {template.body.replace(/{[^}]+}/g, '...')}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{template.usageCount} uses</span>
                        </div>
                        {template.successRate && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>{template.successRate}% success</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Add New Template Card */}
            <Card className="border-dashed hover:border-primary-300 transition-colors cursor-pointer h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <p className="font-medium">Create Template</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save your own email template
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Emails</CardTitle>
              <CardDescription>
                Your recently generated and sent emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.slice(0, 5).map((lead: any, index: number) => (
                  <div key={lead._id} className="flex items-center justify-between p-4 hover:bg-muted rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary-100 text-primary-600">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Email to {lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" size="sm">Draft</Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(lead.createdAt)}
                          </span>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Emails Sent</p>
                    <p className="text-2xl font-bold">{totalEmails}</p>
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
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">{openRate}%</p>
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
                    <p className="text-sm text-muted-foreground">Reply Rate</p>
                    <p className="text-2xl font-bold">{replyRate}%</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meetings Booked</p>
                    <p className="text-2xl font-bold">{meetingsBooked}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Template</CardTitle>
              <CardDescription>
                Which email templates perform best
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedTemplates.map((template) => (
                  <div key={template.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.successRate}% success</p>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${template.successRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EmailGenerator;