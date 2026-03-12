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
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
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
  { id: 'New Lead', name: 'New Leads', color: 'blue', icon: Users },
  { id: 'Contacted', name: 'Contacted', color: 'yellow', icon: Phone },
  { id: 'Qualified', name: 'Qualified', color: 'purple', icon: CheckCircle2 },
  { id: 'Demo Scheduled', name: 'Demo', color: 'indigo', icon: Calendar },
  { id: 'Proposal Sent', name: 'Proposal', color: 'orange', icon: Mail },
  { id: 'Closed Won', name: 'Won', color: 'green', icon: TrendingUp },
  { id: 'Closed Lost', name: 'Lost', color: 'red', icon: XCircle },
];

const stageColors = {
  'New Lead': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    light: 'bg-blue-100',
  },
  'Contacted': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
    light: 'bg-yellow-100',
  },
  'Qualified': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    light: 'bg-purple-100',
  },
  'Demo Scheduled': {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
    light: 'bg-indigo-100',
  },
  'Proposal Sent': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    light: 'bg-orange-100',
  },
  'Closed Won': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-500',
    light: 'bg-green-100',
  },
  'Closed Lost': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    light: 'bg-red-100',
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

  // Calculate stage totals with safety checks
  const stageTotals = stages.reduce((acc, stage) => {
    const stageLeads = Array.isArray(groupedLeads[stage.id]) ? groupedLeads[stage.id] : [];
    acc[stage.id] = {
      count: stageLeads.length,
      value: stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0),
    };
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const totalValue = Object.values(stageTotals).reduce((sum, stage) => sum + stage.value, 0);
  const totalLeads = leads.length;

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
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-600 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-primary-600 animate-pulse">
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
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load pipeline'}
          <Button variant="outline" size="sm" className="ml-4" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Visualize and manage your deals through different stages
          </p>
          {/* Pipeline Summary */}
          <div className="flex items-center gap-6 mt-2 text-sm">
            <div>
              <span className="text-muted-foreground">Total Deals</span>
              <p className="font-bold text-lg">{totalLeads}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pipeline Value</span>
              <p className="font-bold text-lg">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary-600 to-primary-400">
            <Link to="/leads">
              <Plus className="w-4 h-4 mr-2" />
              Add Deal
            </Link>
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {stages.map((stage) => {
          const stats = stageTotals[stage.id] || { count: 0, value: 0 };
          const colors = stageColors[stage.id as keyof typeof stageColors];
          const Icon = stage.icon;
          
          return (
            <motion.div
              key={stage.id}
              whileHover={{ scale: 1.02 }}
              className={`${colors.bg} rounded-lg p-3 border ${colors.border} cursor-pointer`}
              onClick={() => setSelectedStage(stage.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${colors.text}`} />
                <Badge variant="outline" className="bg-white">
                  {stats.count}
                </Badge>
              </div>
              <p className={`text-xs font-medium ${colors.text}`}>{stage.name}</p>
              <p className="text-sm font-bold mt-1">{formatCurrency(stats.value)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto relative">
              <Input
                placeholder="Search deals, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80"
              />
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Select value={filterValue} onValueChange={(v: any) => setFilterValue(v)}>
                <SelectTrigger className="w-[180px]">
                  <Target className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  <SelectItem value="high">High Score (70+)</SelectItem>
                  <SelectItem value="medium">Medium Score (40-69)</SelectItem>
                  <SelectItem value="low">Low Score (0-39)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = groupedLeads[stage.id] || [];
            const filteredStageLeads = filteredLeads(stageLeads);
            const colors = stageColors[stage.id as keyof typeof stageColors];
            const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
            
            return (
              <div
                key={stage.id}
                className={`min-w-[280px] ${colors.bg} rounded-xl p-4 border ${colors.border}`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <h3 className={`font-semibold ${colors.text}`}>{stage.name}</h3>
                    <Badge variant="outline" className="bg-white ml-2">
                      {filteredStageLeads.length}
                    </Badge>
                  </div>
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
                        Sort by Value
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stage Total */}
                <div className="mb-4 p-2 bg-white/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-sm font-bold">{formatCurrency(totalValue)}</p>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[200px] max-h-[600px] overflow-y-auto custom-scrollbar">
                  <AnimatePresence>
                    {filteredStageLeads.map((lead: Lead) => (
                      <motion.div
                        key={lead._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-all"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsDetailsOpen(true);
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white text-xs">
                                {getInitials(lead.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.company}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleMoveClick(lead);
                              }}>
                                Move Stage
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/leads/${lead._id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Deal Value & Score */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-bold">
                              {formatCurrency(lead.value || 0)}
                            </span>
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${getScoreColor(lead.leadScore)} bg-opacity-10`}>
                            Score: {lead.leadScore}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              lead.leadScore >= 70 ? 'bg-green-500' :
                              lead.leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${lead.leadScore}%` }}
                          />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatRelativeTime(lead.updatedAt)}</span>
                          </div>
                          {lead.expectedCloseDate && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(lead.expectedCloseDate)}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredStageLeads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No deals</p>
                      <Button variant="link" size="sm" className="mt-2" asChild>
                        <Link to="/leads">Add Deal</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deal</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stage</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Value</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Score</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expected Close</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Updated</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads
                  .filter((lead: Lead) => {
                    const matchesSearch = searchTerm === '' || 
                      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
                    return matchesSearch;
                  })
                  .map((lead: Lead) => (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white text-xs">
                              {getInitials(lead.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{lead.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(lead.value || 0)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-16 h-2 bg-gray-100 rounded-full overflow-hidden`}>
                            <div
                              className={`h-full rounded-full ${
                                lead.leadScore >= 70 ? 'bg-green-500' :
                                lead.leadScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${lead.leadScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${getScoreColor(lead.leadScore)}`}>
                            {lead.leadScore}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {lead.expectedCloseDate ? formatDate(lead.expectedCloseDate) : 'Not set'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatRelativeTime(lead.updatedAt)}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleMoveClick(lead);
                            }}>
                              Move Stage
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/leads/${lead._id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Deal Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white">
                      {getInitials(selectedLead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{selectedLead.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedLead.company}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status and Score */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(selectedLead.status)}>
                    {selectedLead.status}
                  </Badge>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(selectedLead.leadScore)} bg-opacity-10`}>
                    Score: {selectedLead.leadScore}
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Deal Value</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedLead.value || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{selectedLead.industry}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedLead.phone || 'Not provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium">{selectedLead.source || 'Unknown'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expected Close</p>
                    <p className="font-medium">
                      {selectedLead.expectedCloseDate ? formatDate(selectedLead.expectedCloseDate) : 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedLead.notes && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selectedLead.tags && selectedLead.tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Timeline</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(selectedLead.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{formatRelativeTime(selectedLead.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleMoveClick(selectedLead)}>
                  Move Stage
                </Button>
                <Button asChild>
                  <Link to={`/leads/${selectedLead._id}`}>
                    Full Details
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Move Stage Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Deal</DialogTitle>
            <DialogDescription>
              Select a new stage for {selectedLead?.name}'s deal
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={targetStage} onValueChange={setTargetStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select target stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${stageColors[stage.id as keyof typeof stageColors].dot} mr-2`} />
                      {stage.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMoveConfirm}
              disabled={!targetStage || updateStatusMutation.isPending}
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