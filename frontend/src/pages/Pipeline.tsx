import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Filter,
  MoreHorizontal,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Calendar,
  User,
  Building2,
  Briefcase,
  Target,
  TrendingUp,
  Zap,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Share2,
  Download,
  Upload,
  Grid,
  List,
  Layout,
  PieChart,
  BarChart3,
  Activity,
  Award,
  Star,
  MessageSquare,
  FileText,
  Paperclip,
  Link2,
  MapPin,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  Instagram,
  Youtube,
  Slack,
  Figma,
  Gitlab,
  Terminal,
  Code,
  Database,
  Server,
  Cloud,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Laptop,
  Mic,
  Headphones,
  Gamepad,
  Watch,
  AlarmClock,
  Timer,
  Hourglass,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarHeart,
} from 'lucide-react';

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from '../hooks/useAuth';
import { leadsApi } from '../lib/api';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getInitials,
  getStatusColor,
  getScoreColor,
} from '../lib/utils';

interface Lead {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry: string;
  status: string;
  leadScore: number;
  value: number;
  notes?: string;
  source?: string;
  priority?: string;
  expectedCloseDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const stages = [
  { id: 'New Lead', name: 'New Leads', color: 'blue', icon: Users, description: 'Newly added prospects' },
  { id: 'Contacted', name: 'Contacted', color: 'yellow', icon: Phone, description: 'Initial outreach made' },
  { id: 'Qualified', name: 'Qualified', color: 'purple', icon: CheckCircle2, description: 'Validated opportunities' },
  { id: 'Demo Scheduled', name: 'Demo', color: 'indigo', icon: Calendar, description: 'Product demonstration' },
  { id: 'Proposal Sent', name: 'Proposal', color: 'orange', icon: Mail, description: 'Quote or proposal sent' },
  { id: 'Closed Won', name: 'Won', color: 'green', icon: TrendingUp, description: 'Successfully closed' },
  { id: 'Closed Lost', name: 'Lost', color: 'red', icon: XCircle, description: 'Opportunity lost' },
];

const stageColors = {
  'New Lead': {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    light: 'bg-blue-100',
    hover: 'hover:border-blue-300',
    shadow: 'shadow-blue-100',
    gradient: 'from-blue-500 to-blue-600',
  },
  'Contacted': {
    bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    light: 'bg-yellow-100',
    hover: 'hover:border-yellow-300',
    shadow: 'shadow-yellow-100',
    gradient: 'from-yellow-500 to-yellow-600',
  },
  'Qualified': {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    light: 'bg-purple-100',
    hover: 'hover:border-purple-300',
    shadow: 'shadow-purple-100',
    gradient: 'from-purple-500 to-purple-600',
  },
  'Demo Scheduled': {
    bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    light: 'bg-indigo-100',
    hover: 'hover:border-indigo-300',
    shadow: 'shadow-indigo-100',
    gradient: 'from-indigo-500 to-indigo-600',
  },
  'Proposal Sent': {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    light: 'bg-orange-100',
    hover: 'hover:border-orange-300',
    shadow: 'shadow-orange-100',
    gradient: 'from-orange-500 to-orange-600',
  },
  'Closed Won': {
    bg: 'bg-gradient-to-br from-green-50 to-green-100/50',
    border: 'border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-500',
    light: 'bg-green-100',
    hover: 'hover:border-green-300',
    shadow: 'shadow-green-100',
    gradient: 'from-green-500 to-green-600',
  },
  'Closed Lost': {
    bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    light: 'bg-red-100',
    hover: 'hover:border-red-300',
    shadow: 'shadow-red-100',
    gradient: 'from-red-500 to-red-600',
  },
};

const Pipeline = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [sortBy, setSortBy] = useState<'value' | 'score' | 'date'>('score');
  const [showStats, setShowStats] = useState(true);

  // Fetch leads
  const {
    data: leadsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leads', 'pipeline'],
    queryFn: async () => {
      try {
        const { data } = await leadsApi.getLeads({ limit: 100 });
        return data;
      } catch (error) {
        console.error('Failed to fetch leads:', error);
        return { leads: [] };
      }
    },
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsMoveDialogOpen(false);
      setSelectedLead(null);
    },
  });

  // Safe data extraction with fallbacks
  const leads: Lead[] = Array.isArray(leadsData?.leads) ? leadsData.leads : [];

  // Group leads by stage
  const groupedLeads = stages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter((lead: Lead) => lead.status === stage.id);
    return acc;
  }, {} as Record<string, Lead[]>);

  // Sort leads in each stage
  Object.keys(groupedLeads).forEach(stage => {
    groupedLeads[stage] = groupedLeads[stage].sort((a, b) => {
      if (sortBy === 'value') return (b.value || 0) - (a.value || 0);
      if (sortBy === 'score') return (b.leadScore || 0) - (a.leadScore || 0);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  });

  // Calculate stage totals with safety checks
  const stageTotals = stages.reduce((acc, stage) => {
    const stageLeads = Array.isArray(groupedLeads[stage.id]) ? groupedLeads[stage.id] : [];
    acc[stage.id] = {
      count: stageLeads.length,
      value: stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
      avgScore: stageLeads.length > 0 
        ? Math.round(stageLeads.reduce((sum, lead) => sum + (lead.leadScore || 0), 0) / stageLeads.length)
        : 0,
    };
    return acc;
  }, {} as Record<string, { count: number; value: number; avgScore: number }>);

  const totalValue = Object.values(stageTotals).reduce((sum, stage) => sum + stage.value, 0);
  const totalLeads = leads.length;
  const totalWon = stageTotals['Closed Won']?.count || 0;
  const conversionRate = totalLeads > 0 ? Math.round((totalWon / totalLeads) * 100) : 0;

  const handleMoveClick = (lead: Lead) => {
    setSelectedLead(lead);
    setTargetStage('');
    setIsMoveDialogOpen(true);
  };

  const handleMoveConfirm = () => {
    if (selectedLead && targetStage) {
      updateStatusMutation.mutate({ id: selectedLead._id, status: targetStage });
    }
  };

  const filteredLeads = (stageLeads: Lead[]) => {
    return stageLeads.filter((lead) => {
      const matchesSearch = searchTerm === '' || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterValue === 'all' ||
        (filterValue === 'high' && lead.leadScore >= 70) ||
        (filterValue === 'medium' && lead.leadScore >= 40 && lead.leadScore < 70) ||
        (filterValue === 'low' && lead.leadScore < 40);

      return matchesSearch && matchesFilter;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-blue-600 animate-pulse">
          Loading your pipeline...
        </p>
        <p className="text-sm text-muted-foreground">
          Organizing your deals by stage
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-600">
            {error instanceof Error ? error.message : 'Failed to load pipeline'}
            <Button variant="outline" size="sm" className="ml-4 border-red-200 text-red-600 hover:bg-red-100" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {totalLeads} deals
              </Badge>
            </div>
            <p className="text-blue-100 mt-1 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Visualize and manage your deals through different stages
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}
              >
                <Layout className="w-4 h-4 mr-2" />
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
            <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
              <Link to="/leads">
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </Link>
            </Button>
          </div>
        </div>

        {/* Pipeline Summary Cards */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-xs">Total Pipeline Value</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              <div className="flex items-center mt-1 text-xs text-blue-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>Across {totalLeads} deals</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-xs">Win Rate</p>
              <p className="text-2xl font-bold">{conversionRate}%</p>
              <div className="flex items-center mt-1 text-xs text-blue-200">
                <Award className="w-3 h-3 mr-1" />
                <span>{totalWon} won deals</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-xs">Average Deal Size</p>
              <p className="text-2xl font-bold">{formatCurrency(totalLeads > 0 ? totalValue / totalLeads : 0)}</p>
              <div className="flex items-center mt-1 text-xs text-blue-200">
                <DollarSign className="w-3 h-3 mr-1" />
                <span>Per deal</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-xs">Active Deals</p>
              <p className="text-2xl font-bold">{totalLeads - (stageTotals['Closed Won']?.count + stageTotals['Closed Lost']?.count)}</p>
              <div className="flex items-center mt-1 text-xs text-blue-200">
                <Activity className="w-3 h-3 mr-1" />
                <span>In progress</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stages.map((stage) => {
          const stats = stageTotals[stage.id] || { count: 0, value: 0, avgScore: 0 };
          const colors = stageColors[stage.id as keyof typeof stageColors];
          const Icon = stage.icon;
          
          return (
            <motion.div
              key={stage.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`${colors.bg} rounded-xl p-4 border ${colors.border} ${colors.hover} shadow-sm ${colors.shadow} cursor-pointer transition-all`}
              onClick={() => setSelectedStage(stage.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${colors.light} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <Badge variant="outline" className="bg-white border-0 shadow-sm">
                  {stats.count}
                </Badge>
              </div>
              <p className={`text-xs font-medium ${colors.text}`}>{stage.name}</p>
              <p className="text-sm font-bold mt-1">{formatCurrency(stats.value)}</p>
              <p className="text-xs text-muted-foreground mt-1">Avg Score: {stats.avgScore}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters and Controls */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto relative">
              <Input
                placeholder="Search deals, companies, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Select value={filterValue} onValueChange={(v: any) => setFilterValue(v)}>
                <SelectTrigger className="w-[180px] border-gray-200">
                  <Target className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filter by score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  <SelectItem value="high">High Score (70+)</SelectItem>
                  <SelectItem value="medium">Medium Score (40-69)</SelectItem>
                  <SelectItem value="low">Low Score (0-39)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[180px] border-gray-200">
                  <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Sort by Score</SelectItem>
                  <SelectItem value="value">Sort by Value</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowStats(!showStats)}
                className={showStats ? 'bg-blue-50 border-blue-200' : ''}
              >
                <PieChart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = groupedLeads[stage.id] || [];
            const filteredStageLeads = filteredLeads(stageLeads);
            const colors = stageColors[stage.id as keyof typeof stageColors];
            const stageTotal = stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
            
            return (
              <motion.div
                key={stage.id}
                layout
                className={`min-w-[280px] ${colors.bg} rounded-xl p-4 border ${colors.border} shadow-sm`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colors.dot} animate-pulse`} />
                    <div>
                      <h3 className={`font-semibold ${colors.text}`}>{stage.name}</h3>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="bg-white">
                      {filteredStageLeads.length}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Stage Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Deal
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Stage Total */}
                <div className="mb-4 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white">
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-lg font-bold">{formatCurrency(stageTotal)}</p>
                  <div className="w-full h-1 bg-gray-100 rounded-full mt-2">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                      style={{ width: `${(stageTotal / totalValue) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                  <AnimatePresence>
                    {filteredStageLeads.map((lead: Lead) => (
                      <motion.div
                        key={lead._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsDetailsOpen(true);
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10 ring-2 ring-offset-2 ring-blue-100">
                                <AvatarFallback className={`bg-gradient-to-br ${colors.gradient} text-white`}>
                                  {getInitials(lead.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                lead.leadScore >= 70 ? 'bg-green-500' :
                                lead.leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{lead.name}</p>
                              <p className="text-xs text-gray-500 flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                {lead.company}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleMoveClick(lead);
                              }}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Move Stage
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/leads/${lead._id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Deal Value & Score */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-gray-400" />
                            <span className="text-base font-bold text-gray-900">
                              {formatCurrency(lead.value || 0)}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                            lead.leadScore >= 70 ? 'bg-green-100 text-green-700' :
                            lead.leadScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            <Target className="w-3 h-3" />
                            Score: {lead.leadScore}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${lead.leadScore}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full bg-gradient-to-r ${
                              lead.leadScore >= 70 ? 'from-green-500 to-green-600' :
                              lead.leadScore >= 40 ? 'from-yellow-500 to-yellow-600' :
                              'from-red-500 to-red-600'
                            }`}
                          />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(lead.updatedAt)}</span>
                          </div>
                          {lead.expectedCloseDate && (
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(lead.expectedCloseDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                            {lead.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                                {tag}
                              </Badge>
                            ))}
                            {lead.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs bg-gray-50">
                                +{lead.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredStageLeads.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center bg-white/50 rounded-lg border-2 border-dashed border-gray-200"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">No deals in this stage</p>
                      <Button variant="link" size="sm" className="text-blue-600" asChild>
                        <Link to="/leads">Add a deal</Link>
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Close</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="text-right p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads
                    .filter((lead: Lead) => {
                      const matchesSearch = searchTerm === '' || 
                        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesSearch;
                    })
                    .sort((a, b) => {
                      if (sortBy === 'value') return (b.value || 0) - (a.value || 0);
                      if (sortBy === 'score') return (b.leadScore || 0) - (a.leadScore || 0);
                      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    })
                    .map((lead: Lead, index: number) => (
                      <motion.tr
                        key={lead._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50 cursor-pointer transition-colors group"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10 ring-2 ring-offset-2 ring-blue-100">
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                                {getInitials(lead.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{lead.name}</p>
                              <p className="text-xs text-gray-500 flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                {lead.company}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(lead.status)} border-0`}>
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-gray-900">{formatCurrency(lead.value || 0)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  lead.leadScore >= 70 ? 'bg-green-500' :
                                  lead.leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${lead.leadScore}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${
                              lead.leadScore >= 70 ? 'text-green-600' :
                              lead.leadScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {lead.leadScore}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {lead.expectedCloseDate ? formatDate(lead.expectedCloseDate) : 'Not set'}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(lead.updatedAt)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                              e.stopPropagation();
                              handleMoveClick(lead);
                            }}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link to={`/leads/${lead._id}`}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>

            {leads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No deals found</p>
                <p className="text-sm text-gray-400 mb-4">Get started by adding your first deal</p>
                <Button variant="outline" asChild className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Link to="/leads">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Deal
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deal Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          {selectedLead && (
            <>
              {/* Header with gradient */}
              <div className={`h-24 bg-gradient-to-r ${stageColors[selectedLead.status as keyof typeof stageColors]?.gradient || 'from-blue-600 to-indigo-600'}`} />
              
              <div className="px-6 pb-6">
                {/* Avatar overlapping */}
                <div className="flex items-start justify-between -mt-12 mb-4">
                  <Avatar className="w-20 h-20 ring-4 ring-white shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl">
                      {getInitials(selectedLead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className={getStatusColor(selectedLead.status)}>
                    {selectedLead.status}
                  </Badge>
                </div>

                {/* Name and Company */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h2>
                  <p className="text-gray-500 flex items-center mt-1">
                    <Building2 className="w-4 h-4 mr-2" />
                    {selectedLead.company}
                  </p>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Deal Value</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedLead.value || 0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Lead Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            selectedLead.leadScore >= 70 ? 'bg-green-500' :
                            selectedLead.leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedLead.leadScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{selectedLead.leadScore}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Industry</p>
                    <p className="font-medium flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedLead.industry}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Source</p>
                    <p className="font-medium">{selectedLead.source || 'Unknown'}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{selectedLead.email}</p>
                    </div>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium">{selectedLead.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedLead.notes && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selectedLead.tags && selectedLead.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-100">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium mb-3">Timeline</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Created</span>
                      <span className="font-medium">{formatDate(selectedLead.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="font-medium">{formatRelativeTime(selectedLead.updatedAt)}</span>
                    </div>
                    {selectedLead.expectedCloseDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Expected Close</span>
                        <span className="font-medium">{formatDate(selectedLead.expectedCloseDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 pb-6 pt-2 border-t border-gray-100">
                <div className="flex space-x-3 w-full">
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="flex-1">
                    Close
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleMoveClick(selectedLead)}
                    className="flex-1"
                  >
                    Move Stage
                  </Button>
                  <Button asChild className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Link to={`/leads/${selectedLead._id}`}>
                      Full Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Move Stage Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Move Deal</DialogTitle>
            <DialogDescription>
              Select a new stage for <span className="font-semibold text-gray-900">{selectedLead?.name}</span>'s deal
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Select value={targetStage} onValueChange={setTargetStage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => {
                  const colors = stageColors[stage.id as keyof typeof stageColors];
                  return (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${colors.dot} mr-3`} />
                        <span>{stage.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {selectedLead && targetStage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 rounded-lg"
              >
                <p className="text-sm text-blue-700">
                  Moving from <span className="font-semibold">{selectedLead.status}</span> to{' '}
                  <span className="font-semibold">{targetStage}</span>
                </p>
              </motion.div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMoveConfirm}
              disabled={!targetStage || updateStatusMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {updateStatusMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                'Move Deal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Pipeline;