import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  Clock,
  Activity,
  ArrowRight,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Calendar,
  MessageSquare,
  FileText,
  Target,
  Brain,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Download,
  Share2,
  Eye,
  EyeOff,
  Filter,
  SortAsc,
  SortDesc,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
  Bot,
  AlertOctagon,
  Flame,
  Snowflake,
  Thermometer,
  Gauge,
  Radar,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
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
import { Progress } from '../components/ui/progress';
import { useAuth } from '../hooks/useAuth';
import { aiApi, leadsApi, tasksApi } from '../lib/api';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '../lib/utils';

interface RiskFactor {
  type: string;
  status: 'Healthy' | 'Warning' | 'Danger';
  label: string;
  impact: 'Low' | 'Medium' | 'High';
  trend: 'improving' | 'stable' | 'declining';
}

interface RiskAnalysis {
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  factors: RiskFactor[];
  recommendations: string[];
  probability?: number;
  impact?: number;
  velocity?: number;
  healthScore?: number;
  stageRisk?: Record<string, number>;
  competitorMentions?: string[];
  decisionMaker?: {
    engaged: boolean;
    level: string;
    lastContact?: string;
  };
  timeline?: {
    expectedClose: string;
    daysInStage: number;
    velocity: 'slow' | 'normal' | 'fast';
  };
}

interface Deal {
  _id: string;
  name: string;
  company: string;
  value: number;
  status: string;
  leadScore: number;
  industry: string;
  lastInteraction?: string;
  expectedCloseDate?: string;
  daysInStage?: number;
  riskAnalysis?: RiskAnalysis;
}

const DealRisk = () => {
  const { user } = useAuth();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskData, setRiskData] = useState<RiskAnalysis | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'value' | 'days'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'grid' | 'list'>('cards');

  // Fetch leads for analysis
  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', 'risk-analysis'],
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

  // AI Predict Risk Mutation
  const predictRiskMutation = useMutation({
    mutationFn: (leadId: string) => aiApi.predictDealRisk(leadId),
    onSuccess: (data) => {
      setRiskData(data.data.riskAnalysis);
      setIsAnalyzing(false);
    },
    onError: () => {
      setIsAnalyzing(false);
    },
  });

  // Create Task from Recommendation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.createTask(data),
  });

  const deals: Deal[] = leadsData?.leads || [];

  // Calculate risk score with fallback when AI data is not available
  const calculateRiskScore = (deal: Deal) => {
    let score = 20; // Base risk

    // Long time in stage increases risk
    if (deal.daysInStage && deal.daysInStage > 30) score += 25;
    else if (deal.daysInStage && deal.daysInStage > 14) score += 15;

    // No recent interaction increases risk
    if (!deal.lastInteraction) {
      score += 20;
    } else {
      const daysSinceActivity = (Date.now() - new Date(deal.lastInteraction).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity > 10) score += 15;
      else if (daysSinceActivity > 5) score += 10;
    }

    // Low lead score increases risk
    if (deal.leadScore < 40) score += 20;
    else if (deal.leadScore < 60) score += 10;

    // High value deals are slightly riskier
    if (deal.value > 100000) score += 15;
    else if (deal.value > 50000) score += 10;

    // Stage-based risk
    if (deal.status === 'Proposal Sent' && deal.daysInStage && deal.daysInStage > 14) score += 20;
    if (deal.status === 'Negotiation' && deal.daysInStage && deal.daysInStage > 7) score += 15;
    if (deal.status === 'Closed Lost') score = 100;

    return Math.min(Math.max(Math.round(score), 0), 100);
  };

  // Get risk level from score
  const getRiskLevelFromScore = (score: number): 'Low' | 'Medium' | 'High' => {
    if (score > 70) return 'High';
    if (score > 40) return 'Medium';
    return 'Low';
  };

  // Auto-analyze deals that don't have risk analysis
  useEffect(() => {
    if (deals.length > 0) {
      deals.forEach(deal => {
        if (!deal.riskAnalysis) {
          predictRiskMutation.mutate(deal._id);
        }
      });
    }
  }, [deals]);

  const handleAnalyzeDeal = async (deal: Deal) => {
    setSelectedDeal(deal);
    setIsAnalyzing(true);
    setShowDetails(true);

    try {
      await predictRiskMutation.mutateAsync(deal._id);
    } catch (error) {
      console.error('Failed to analyze deal risk:', error);
    }
  };

  const handleAnalyzeAll = async () => {
    setIsAnalyzing(true);
    for (const deal of deals) {
      try {
        await predictRiskMutation.mutateAsync(deal._id);
      } catch (error) {
        console.error(`Failed to analyze deal ${deal._id}:`, error);
      }
    }
    setIsAnalyzing(false);
  };

  const handleCreateTask = (recommendation: string) => {
    if (!selectedDeal) return;
    
    createTaskMutation.mutate({
      title: `Risk Mitigation: ${recommendation.substring(0, 50)}`,
      leadId: selectedDeal._id,
      description: recommendation,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'High',
      status: 'pending',
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: ShieldCheck,
          gradient: 'from-green-500 to-green-400',
        };
      case 'Medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: ShieldAlert,
          gradient: 'from-yellow-500 to-yellow-400',
        };
      case 'High':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: ShieldX,
          gradient: 'from-red-500 to-red-400',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: Shield,
          gradient: 'from-gray-500 to-gray-400',
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'Danger':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-green-600 rotate-180" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  // Process deals with calculated risk scores
  const processedDeals = deals.map(deal => {
    const aiRiskScore = deal.riskAnalysis?.riskScore;
    const calculatedScore = calculateRiskScore(deal);
    const finalScore = aiRiskScore ?? calculatedScore;
    const finalLevel = deal.riskAnalysis?.riskLevel ?? getRiskLevelFromScore(finalScore);
    
    return {
      ...deal,
      displayRiskScore: finalScore,
      displayRiskLevel: finalLevel,
      hasAIAnalysis: !!deal.riskAnalysis
    };
  });

  const filteredDeals = processedDeals
    .filter((deal) => {
      if (filterRisk === 'all') return true;
      return deal.displayRiskLevel.toLowerCase() === filterRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') {
        return sortOrder === 'desc' 
          ? b.displayRiskScore - a.displayRiskScore 
          : a.displayRiskScore - b.displayRiskScore;
      } else if (sortBy === 'value') {
        return sortOrder === 'desc' 
          ? (b.value || 0) - (a.value || 0) 
          : (a.value || 0) - (b.value || 0);
      } else {
        const aDays = a.daysInStage || 0;
        const bDays = b.daysInStage || 0;
        return sortOrder === 'desc' ? bDays - aDays : aDays - bDays;
      }
    });

  const highRiskCount = processedDeals.filter(d => d.displayRiskLevel === 'High').length;
  const mediumRiskCount = processedDeals.filter(d => d.displayRiskLevel === 'Medium').length;
  const lowRiskCount = processedDeals.filter(d => d.displayRiskLevel === 'Low').length;
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const atRiskValue = processedDeals
    .filter(d => d.displayRiskLevel === 'High')
    .reduce((sum, d) => sum + (d.value || 0), 0);
  const pipelineRiskPercent = totalValue > 0 
    ? Math.round((atRiskValue / totalValue) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Radar className="w-8 h-8 text-primary-600 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-primary-600 animate-pulse">
          Scanning for risks...
        </p>
        <p className="text-sm text-muted-foreground">
          Analyzing deal health and identifying potential issues
        </p>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Risk Predictor</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered risk analysis to identify and mitigate deal threats
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isAnalyzing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            className="bg-gradient-to-r from-primary-600 to-primary-400"
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Radar className="w-4 h-4 mr-2" />
                Scan All Deals
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk Value</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(atRiskValue)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Risk</p>
                <p className="text-2xl font-bold text-orange-600">{pipelineRiskPercent}%</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertOctagon className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ShieldX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumRiskCount}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Select value={filterRisk} onValueChange={(v: any) => setFilterRisk(v)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Risk Score</SelectItem>
                  <SelectItem value="value">Deal Value</SelectItem>
                  <SelectItem value="days">Days in Stage</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <PieChart className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Activity className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Dashboard */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal, index) => {
            const colors = getRiskLevelColor(deal.displayRiskLevel);
            const RiskIcon = colors.icon;
            const riskScore = deal.displayRiskScore;
            const gradient = riskScore > 70 
              ? 'from-red-500 to-red-400' 
              : riskScore > 40 
                ? 'from-yellow-500 to-yellow-400' 
                : 'from-green-500 to-green-400';

            return (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="cursor-pointer"
                onClick={() => handleAnalyzeDeal(deal)}
              >
                <Card className={`border-l-4 ${
                  deal.displayRiskLevel === 'High' ? 'border-l-red-500' :
                  deal.displayRiskLevel === 'Medium' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                } hover:shadow-lg transition-all`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white">
                            {getInitials(deal.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{deal.name}</h3>
                          <p className="text-sm text-muted-foreground">{deal.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {deal.hasAIAnalysis && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            AI
                          </Badge>
                        )}
                        <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                          <RiskIcon className="w-3 h-3 mr-1" />
                          {deal.displayRiskLevel} Risk
                        </Badge>
                      </div>
                    </div>

                    {/* Risk Score Gauge */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Risk Score</span>
                        <span className={`font-bold ${colors.text}`}>{riskScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                          style={{ width: `${riskScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {riskScore > 70 && '⚠️ Critical deal risk'}
                        {riskScore > 40 && riskScore <= 70 && '👀 Needs attention'}
                        {riskScore <= 40 && '✅ Healthy deal'}
                      </p>
                    </div>

                    {/* Risk Heatmap */}
                    <div className="grid grid-cols-5 gap-1 mb-4">
                      {[...Array(25)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded ${
                            i < riskScore / 4 
                              ? riskScore > 70 
                                ? 'bg-red-400' 
                                : riskScore > 40 
                                  ? 'bg-yellow-400' 
                                  : 'bg-green-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="text-sm font-bold">{formatCurrency(deal.value || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-sm font-bold">{deal.leadScore}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stage</p>
                        <p className="text-sm font-medium truncate">{deal.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Contact</p>
                        <p className="text-sm font-medium">
                          {deal.lastInteraction ? formatRelativeTime(deal.lastInteraction) : 'Never'}
                        </p>
                      </div>
                    </div>

                    {/* Risk Trend */}
                    <div className="flex items-center justify-between text-xs border-t pt-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Trend:</span>
                        {deal.leadScore && (
                          <>
                            {deal.leadScore > riskScore ? (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                <TrendingDown className="w-3 h-3 mr-1 rotate-180" />
                                Improving
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Declining
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7">
                        Analyze
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredDeals.map((deal) => {
                const colors = getRiskLevelColor(deal.displayRiskLevel);
                const RiskIcon = colors.icon;
                const riskScore = deal.displayRiskScore;

                return (
                  <div
                    key={deal._id}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleAnalyzeDeal(deal)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(deal.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{deal.name}</p>
                          <p className="text-xs text-muted-foreground">{deal.company}</p>
                        </div>
                      </div>
                      <RiskIcon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <span className="ml-1 font-medium">{formatCurrency(deal.value || 0)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risk:</span>
                        <span className={`ml-1 font-medium ${colors.text}`}>
                          {riskScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Deal</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Risk Level</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Score</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Value</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stage</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Contact</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDeals.map((deal) => {
                  const colors = getRiskLevelColor(deal.displayRiskLevel);
                  const RiskIcon = colors.icon;
                  const riskScore = deal.displayRiskScore;

                  return (
                    <tr
                      key={deal._id}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleAnalyzeDeal(deal)}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(deal.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{deal.name}</p>
                            <p className="text-sm text-muted-foreground">{deal.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                          <RiskIcon className="w-3 h-3 mr-1" />
                          {deal.displayRiskLevel}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${
                                riskScore > 70 
                                  ? 'from-red-500 to-red-400' 
                                  : riskScore > 40 
                                    ? 'from-yellow-500 to-yellow-400' 
                                    : 'from-green-500 to-green-400'
                              }`}
                              style={{ width: `${riskScore}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${colors.text}`}>
                            {riskScore}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{formatCurrency(deal.value || 0)}</td>
                      <td className="p-4">{deal.status}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {deal.lastInteraction ? formatRelativeTime(deal.lastInteraction) : 'Never'}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalyzeDeal(deal);
                          }}
                        >
                          Analyze
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Risk Analysis Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          {selectedDeal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Radar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <span>Risk Analysis: {selectedDeal.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedDeal.company}
                    </p>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  AI-powered risk assessment and mitigation recommendations
                </DialogDescription>
              </DialogHeader>

              {isAnalyzing ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-primary-600 animate-pulse">
                    Analyzing risk factors...
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Evaluating deal health, engagement signals, and competitive threats
                  </p>
                </div>
              ) : riskData ? (
                <div className="space-y-6">
                  {/* Risk Score Gauge */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-background rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Overall Risk Score</p>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-bold">{riskData.riskScore}</span>
                        <span className="text-lg text-muted-foreground">/100</span>
                      </div>
                      <Badge className={`mt-2 ${
                        riskData.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        riskData.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {riskData.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="w-32 h-32 relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - riskData.riskScore / 100)}`}
                          className={`${
                            riskData.riskLevel === 'High' ? 'text-red-500' :
                            riskData.riskLevel === 'Medium' ? 'text-yellow-500' :
                            'text-green-500'
                          } transition-all duration-1000`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Gauge className={`w-8 h-8 ${
                          riskData.riskLevel === 'High' ? 'text-red-500' :
                          riskData.riskLevel === 'Medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Target className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <p className="text-xs text-muted-foreground">Probability</p>
                      <p className="text-lg font-bold">{riskData.probability || 65}%</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <DollarSign className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <p className="text-xs text-muted-foreground">Impact</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedDeal.value || 0)}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <p className="text-xs text-muted-foreground">Velocity</p>
                      <p className="text-lg font-bold capitalize">{riskData.velocity || 'Normal'}</p>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                      Risk Factors
                    </h4>
                    <div className="space-y-3">
                      {riskData.factors.map((factor, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border ${
                            factor.status === 'Healthy' ? 'bg-green-50 border-green-200' :
                            factor.status === 'Warning' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getStatusIcon(factor.status)}
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium">{factor.type}</p>
                                  <Badge variant="outline" size="sm">
                                    Impact: {factor.impact}
                                  </Badge>
                                </div>
                                <p className="text-sm mt-1">{factor.label}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(factor.trend)}
                              <span className="text-xs capitalize text-muted-foreground">
                                {factor.trend}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {riskData.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start justify-between p-3 bg-primary-50 rounded-lg"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary-700">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-sm text-primary-700 flex-1">{rec}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCreateTask(rec)}
                            >
                              Create Task
                            </Button>
                            <Button size="sm">Apply</Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  {riskData.timeline && (
                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-medium mb-3">Timeline Analysis</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Expected Close</p>
                          <p className="font-medium">{riskData.timeline.expectedClose}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Days in Stage</p>
                          <p className="font-medium">{riskData.timeline.daysInStage} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Velocity</p>
                          <p className={`font-medium capitalize ${
                            riskData.timeline.velocity === 'slow' ? 'text-red-600' :
                            riskData.timeline.velocity === 'fast' ? 'text-green-600' :
                            'text-yellow-600'
                          }`}>
                            {riskData.timeline.velocity}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <DialogFooter className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                {riskData && (
                  <>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button>
                      <Target className="w-4 h-4 mr-2" />
                      Create Mitigation Plan
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default DealRisk;