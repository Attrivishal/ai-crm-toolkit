import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Mail,
  Edit2,
  Trash2,
  ArrowUpRight,
  Sparkles,
  MoreHorizontal,
  Download,
  RefreshCw,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Phone,
  Building2,
  Globe,
  Calendar,
  Clock,
  User,
  Briefcase,
  DollarSign,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  MessageSquare,
  Star,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Bookmark,
  Flag,
  Tag,
  Layers,
  Settings,
  ChevronDown,
  Upload,
  DownloadCloud,
  FileText,
  UserPlus,
  UserMinus,
  UserCheck,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  HelpCircle,
  Info,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useAuth } from '../hooks/useAuth';
import { leadsApi } from '../lib/api';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getInitials,
  getStatusColor,
  getScoreColor,
  truncateText,
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
  interactionCount?: number;
  lastInteraction?: string;
}

const Leads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: '',
    value: '',
    notes: '',
    source: 'Website',
    status: 'New Lead',
  });

  // Fetch leads with filters and pagination
  const {
    data: leadsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leads', currentPage, statusFilter, industryFilter, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (industryFilter !== 'all') params.industry = industryFilter;
      if (searchTerm) params.search = searchTerm;
      
      try {
        const { data } = await leadsApi.getLeads(params);
        return data;
      } catch (error) {
        console.error('Failed to fetch leads:', error);
        return { leads: [], pagination: { total: 0, pages: 1, page: 1, limit: 10 } };
      }
    },
  });

  // Delete lead mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsDeleteDialogOpen(false);
      setSelectedLead(null);
    },
  });

  // Create lead mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => leadsApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  // Update lead mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => leadsApi.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsEditDialogOpen(false);
      setSelectedLead(null);
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => leadsApi.deleteLead(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setSelectedRows([]);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      industry: '',
      value: '',
      notes: '',
      source: 'Website',
      status: 'New Lead',
    });
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone || '',
      industry: lead.industry,
      value: lead.value.toString(),
      notes: lead.notes || '',
      source: lead.source || 'Website',
      status: lead.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedLead) {
      deleteMutation.mutate(selectedLead._id);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedRows.length > 0) {
      bulkDeleteMutation.mutate(selectedRows);
    }
  };

  const handleCreateSubmit = () => {
    createMutation.mutate({
      ...formData,
      value: parseFloat(formData.value) || 0,
    });
  };

  const handleUpdateSubmit = () => {
    if (selectedLead) {
      updateMutation.mutate({
        id: selectedLead._id,
        data: {
          ...formData,
          value: parseFloat(formData.value) || 0,
        },
      });
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === leads.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(leads.map(l => l._id));
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPriorityIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-3 h-3" />;
    if (score >= 60) return <Activity className="w-3 h-3" />;
    if (score >= 40) return <AlertCircle className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Consulting',
    'Marketing',
    'Other',
  ];

  const sources = [
    'Website',
    'Referral',
    'LinkedIn',
    'Email Campaign',
    'Event',
    'Cold Call',
    'Partner',
    'Other',
  ];

  const statuses = [
    'New Lead',
    'Contacted',
    'Qualified',
    'Demo Scheduled',
    'Proposal Sent',
    'Closed Won',
    'Closed Lost',
  ];

  // Safe data extraction with fallbacks
  const leads = Array.isArray(leadsData?.leads) ? leadsData.leads : [];
  const pagination = leadsData?.pagination || { total: 0, pages: 1, page: 1, limit: 10 };

  // Calculate stats
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const avgScore = leads.length > 0
    ? Math.round(leads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / leads.length)
    : 0;
  const conversionRate = leads.length > 0
    ? Math.round((leads.filter(l => l.status === 'Closed Won').length / leads.length) * 100)
    : 0;
  const highPriorityCount = leads.filter(l => (l.leadScore || 0) >= 70).length;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
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
          Loading your leads...
        </p>
        <p className="text-sm text-muted-foreground">
          Preparing your sales pipeline
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
            {error instanceof Error ? error.message : 'Failed to load leads'}
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {pagination.total} total
              </Badge>
            </div>
            <p className="text-blue-100 mt-1 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              Manage and track your sales opportunities with AI-powered insights
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
            <Button 
              variant="secondary" 
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Add New Lead</DialogTitle>
                  <DialogDescription>
                    Enter the lead details below. AI will analyze and score the lead automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <User className="w-4 h-4 mr-2 text-blue-600" />
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                      Company *
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Inc"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@acme.com"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-blue-600" />
                      Phone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 890"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                      Industry *
                    </label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                      Deal Value ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="50000"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-blue-600" />
                      Source
                    </label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => setFormData({ ...formData, source: value })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Flag className="w-4 h-4 mr-2 text-blue-600" />
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Additional notes about the lead..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-200">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSubmit}
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Lead'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+12% vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                <span>{formatCurrency(totalValue * 0.15)} this month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-purple-600">
                <Activity className="w-3 h-3 mr-1" />
                <span>{highPriorityCount} high priority</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                  <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-orange-600">
                <Target className="w-3 h-3 mr-1" />
                <span>Target: 75%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {leads.filter(l => !['Closed Won', 'Closed Lost'].includes(l.status)).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-pink-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-pink-600">
                <Clock className="w-3 h-3 mr-1" />
                <span>{leads.filter(l => l.status === 'Proposal Sent').length} in proposal</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search leads, companies, emails..."
                    className="pl-10 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {(statusFilter !== 'all' || industryFilter !== 'all') && (
                      <Badge className="ml-2 bg-blue-600 text-white border-0">1</Badge>
                    )}
                  </Button>
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className={viewMode === 'table' ? 'bg-blue-600 text-white' : ''}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-blue-600 text-white' : ''}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
                          <Select value={industryFilter} onValueChange={setIndustryFilter}>
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="All Industries" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Industries</SelectItem>
                              {industries.map((industry) => (
                                <SelectItem key={industry} value={industry}>
                                  {industry}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Sort By</label>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="createdAt">Date Added</SelectItem>
                              <SelectItem value="leadScore">Score</SelectItem>
                              <SelectItem value="value">Value</SelectItem>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="company">Company</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Order</label>
                          <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                            <SelectTrigger className="border-gray-200">
                              <SelectValue placeholder="Order" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desc">Descending</SelectItem>
                              <SelectItem value="asc">Ascending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions Bar */}
      {selectedRows.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-600 text-white border-0">{selectedRows.length}</Badge>
                  <span className="text-sm text-blue-700">leads selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100">
                    <Tag className="w-4 h-4 mr-2" />
                    Tag
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDeleteConfirm}
                    disabled={bulkDeleteMutation.isPending}
                  >
                    {bulkDeleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leads Display */}
      {viewMode === 'table' ? (
        <motion.div variants={itemVariants}>
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === leads.length && leads.length > 0}
                        onChange={toggleAllRows}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                      />
                    </TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-2">No leads found</p>
                          <p className="text-sm text-gray-400 mb-4">Get started by adding your first lead</p>
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                            <Plus className="w-4 h-4 mr-2" />
                            Add your first lead
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead: Lead) => (
                      <TableRow key={lead._id} className="group hover:bg-gray-50/50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(lead._id)}
                            onChange={() => toggleRowSelection(lead._id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10 ring-2 ring-blue-100">
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                                {getInitials(lead.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{lead.name}</p>
                              <p className="text-sm text-gray-500">{lead.company}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">{lead.email}</p>
                            {lead.phone && (
                              <p className="text-sm text-gray-400">{lead.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                            {lead.industry}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(lead.status)} border-0`}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${getPriorityColor(lead.leadScore)}`}>
                              {getPriorityIcon(lead.leadScore)}
                              <span>{lead.leadScore}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900">{formatCurrency(lead.value || 0)}</p>
                        </TableCell>
                        <TableCell>
                          {lead.lastInteraction ? (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(lead.lastInteraction)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link to={`/pipeline?lead=${lead._id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(lead)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Schedule Meeting
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteClick(lead)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No leads found</p>
              <p className="text-sm text-gray-400 mb-4">Get started by adding your first lead</p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Plus className="w-4 h-4 mr-2" />
                Add your first lead
              </Button>
            </div>
          ) : (
            leads.map((lead: Lead) => (
              <motion.div
                key={lead._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-14 h-14 ring-2 ring-blue-100">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-lg">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getPriorityColor(lead.leadScore).split(' ')[0]}`}>
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              {getPriorityIcon(lead.leadScore)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                          <p className="text-sm text-gray-500">{lead.company}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(lead)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(lead)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getStatusColor(lead.status)} border-0`}>
                          {lead.status}
                        </Badge>
                        <div className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${getPriorityColor(lead.leadScore)}`}>
                          {getPriorityIcon(lead.leadScore)}
                          <span>Score: {lead.leadScore}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{lead.industry}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{formatCurrency(lead.value || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 col-span-2">
                          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center space-x-2 text-gray-600 col-span-2">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Added {formatRelativeTime(lead.createdAt)}</span>
                        </div>
                        {lead.interactionCount ? (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <MessageSquare className="w-3 h-3" />
                            <span>{lead.interactionCount} interactions</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 2)
              .map((p, i, arr) => {
                if (i > 0 && arr[i - 1] !== p - 1) {
                  return (
                    <span key={`ellipsis-${p}`} className="text-gray-400">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={p}
                    variant={currentPage === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(p)}
                    className={currentPage === p ? 'bg-blue-600 text-white' : 'border-gray-200'}
                  >
                    {p}
                  </Button>
                );
              })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
              disabled={currentPage === pagination.pages}
              className="border-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedLead?.name}</span> from <span className="font-semibold text-gray-900">{selectedLead?.company}</span>?
              This action cannot be undone and all associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                This will also delete all interactions, tasks, and history associated with this lead.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-gray-200">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Lead'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Lead</DialogTitle>
            <DialogDescription>
              Update the lead details below. Changes will be saved automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Full Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                Company *
              </label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                Industry *
              </label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                Deal Value ($)
              </label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Tag className="w-4 h-4 mr-2 text-blue-600" />
                Source
              </label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Flag className="w-4 h-4 mr-2 text-blue-600" />
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Additional notes about the lead..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-200">
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubmit}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Lead'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Leads;