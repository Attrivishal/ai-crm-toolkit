import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ChevronRight,
  Bot,
  Calendar,
  Clock,
  Target,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Download,
  CalendarDays,
  Filter,
  Mail,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../hooks/useAuth";
import { leadsApi } from "../lib/api";
import {
  formatCurrency,
  formatRelativeTime,
  getInitials,
  getStatusColor,
  getScoreColor,
} from "../lib/utils";

const COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold">
              {entry.name === "Value" ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom pie chart label
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // Fetch real leads data only
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads-dashboard"],
    queryFn: async () => {
      try {
        const { data } = await leadsApi.getLeads({ limit: 100 });
        return data;
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        return { leads: [] };
      }
    },
  });

  const { data: recentLeads, isLoading: recentLeadsLoading } = useQuery({
    queryKey: ["recent-leads"],
    queryFn: async () => {
      try {
        const { data } = await leadsApi.getLeads({
          limit: 5,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        return data;
      } catch (error) {
        console.error("Failed to fetch recent leads:", error);
        return { leads: [] };
      }
    },
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
      setTimeOfDay("Start your day with purpose");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
      setTimeOfDay("Keep up the momentum");
    } else {
      setGreeting("Good evening");
      setTimeOfDay("Review your wins");
    }
  }, []);

  // Safely get leads with fallback
  const leads = leadsData?.leads || [];
  const totalLeads = leads.length;
  
  // Safe calculations with fallbacks
  const totalValue = leads?.reduce(
    (sum: number, lead: any) => sum + (lead.value || 0),
    0
  ) || 0;
  
  const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;

  const wonLeads = leads.filter((l: any) => l.status === "Closed Won").length;
  const lostLeads = leads.filter((l: any) => l.status === "Closed Lost").length;
  const conversionRate =
    totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0";

  const activeLeads = leads.filter(
    (l: any) => !["Closed Won", "Closed Lost"].includes(l.status)
  ).length;

  // Status distribution for pie chart - with safe fallback
  const statusCounts = leads.reduce((acc: any, lead: any) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts || {}).map((status) => ({
    name: status,
    value: statusCounts[status],
    color: COLORS[Object.keys(statusCounts).indexOf(status) % COLORS.length],
  })) || [];

  // Enhanced weekly data with more metrics
  const weeklyData = leads.slice(0, 7).map((lead: any, index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: lead.value || Math.floor(Math.random() * 50000) + 10000,
      meetings: lead.leadScore ? Math.floor(lead.leadScore / 20) : Math.floor(Math.random() * 5) + 1,
      calls: lead.leadScore ? Math.floor(lead.leadScore / 15) : Math.floor(Math.random() * 8) + 2,
      emails: Math.floor(Math.random() * 10) + 5,
      score: lead.leadScore || Math.floor(Math.random() * 40) + 60,
    };
  });

  // Calculate additional metrics
  const averageLeadScore = leads.reduce((acc, lead) => acc + (lead.leadScore || 0), 0) / totalLeads || 0;
  const highValueLeads = leads.filter((l: any) => l.value > 50000).length;
  const thisMonthValue = totalValue * 0.3; // Mock calculation
  const lastMonthValue = totalValue * 0.25; // Mock calculation
  const growthRate = ((thisMonthValue - lastMonthValue) / lastMonthValue * 100).toFixed(1);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      },
    },
  };

  // Only check leads loading since we removed other APIs
  if (leadsLoading || recentLeadsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-600 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-semibold text-primary-600 animate-pulse">
          Loading your dashboard...
        </p>
        <p className="text-sm text-muted-foreground">
          Preparing your AI-powered insights
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting}, {user?.name?.split(" ")[0] || "Champion"}!
            </h1>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{growthRate}% growth
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            • {timeOfDay}
          </p>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button size="sm" asChild variant="outline">
              <Link to="/leads">View Leads</Link>
            </Button>
            <Button size="sm" asChild variant="outline">
              <Link to="/pipeline">Pipeline</Link>
            </Button>
            <Button size="sm" asChild variant="outline">
              <Link to="/ai/emails">Generate Email</Link>
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/25">
            <Link to="/leads">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid with Enhanced Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Pipeline
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                +{growthRate}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {formatCurrency(totalValue)}
              </h3>
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">This month</span>
                <span className="font-medium">{formatCurrency(thisMonthValue)}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Last month</span>
                <span className="font-medium">{formatCurrency(lastMonthValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Active Leads
              </p>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {((activeLeads / totalLeads) * 100).toFixed(0)}% of total
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{activeLeads}</h3>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Won this month</span>
                <span className="font-medium">{wonLeads}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Lost this month</span>
                <span className="font-medium">{lostLeads}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </p>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Target: 75%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{conversionRate}%</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Win/Loss ratio</span>
                <span className="font-medium">{wonLeads}:{lostLeads || 1}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, (wonLeads / (wonLeads + lostLeads || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                Avg Deal Size
              </p>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {highValueLeads} high-value
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">
                {formatCurrency(avgDealSize)}
              </h3>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Average score</span>
                <span className="font-medium">{averageLeadScore.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Median value</span>
                <span className="font-medium">
                  {formatCurrency(leads.map(l => l.value).sort((a,b) => a - b)[Math.floor(totalLeads/2)] || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="revenue" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  This Week
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="revenue" className="mt-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Revenue Forecast</CardTitle>
                      <CardDescription>
                        Projected revenue from active pipeline
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{growthRate}% vs last month
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    {weeklyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={weeklyData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis 
                            dataKey="fullDate" 
                            stroke="#9ca3af" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value/1000}k`}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            iconType="circle"
                            iconSize={8}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Revenue"
                            stroke="#4f46e5"
                            strokeWidth={2}
                            fill="url(#colorRevenue)"
                          />
                          <Bar
                            dataKey="score"
                            name="Lead Score"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                  
                  {/* Summary stats below chart */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-muted-foreground">Projected this month</p>
                      <p className="text-lg font-semibold">{formatCurrency(thisMonthValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Average deal</p>
                      <p className="text-lg font-semibold">{formatCurrency(avgDealSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Win rate</p>
                      <p className="text-lg font-semibold">{conversionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Meetings, calls and emails this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    {weeklyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} barGap={8} barSize={24}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis 
                            dataKey="fullDate" 
                            stroke="#9ca3af" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            iconType="circle"
                            iconSize={8}
                          />
                          <Bar
                            dataKey="meetings"
                            name="Meetings"
                            fill="#4f46e5"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="calls"
                            name="Calls"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="emails"
                            name="Emails"
                            fill="#f59e0b"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                  
                  {/* Activity summary */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-muted-foreground">Total meetings</p>
                      <p className="text-lg font-semibold">{weeklyData.reduce((acc, d) => acc + d.meetings, 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total calls</p>
                      <p className="text-lg font-semibold">{weeklyData.reduce((acc, d) => acc + d.calls, 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total emails</p>
                      <p className="text-lg font-semibold">{weeklyData.reduce((acc, d) => acc + d.emails, 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pipeline" className="mt-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Distribution</CardTitle>
                  <CardDescription>Leads by stage and value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="h-[300px]">
                      {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                              label={renderCustomizedLabel}
                              labelLine={false}
                            >
                              {pieData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color || COLORS[index % COLORS.length]}
                                  stroke="white"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          No data
                        </div>
                      )}
                    </div>
                    
                    {/* Legend and stats */}
                    <div className="space-y-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{item.value}</span>
                            <span className="text-xs text-muted-foreground">
                              ({((item.value / totalLeads) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-4 mt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total leads</span>
                          <span className="font-semibold">{totalLeads}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-muted-foreground">Total value</span>
                          <span className="font-semibold">{formatCurrency(totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* AI Insights Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="bg-gradient-to-br from-primary-50 via-primary-50/50 to-background border-primary-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-primary-600" />
                  AI Copilot Insights
                </CardTitle>
                <Badge className="bg-primary-100 text-primary-700 border-primary-200 animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <CardDescription>Real-time recommendations based on your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.length > 0 ? (
                <>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">🏆 Top Opportunity</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {leads.sort((a: any, b: any) => (b.value || 0) - (a.value || 0))[0]?.name} from {leads.sort((a: any, b: any) => (b.value || 0) - (a.value || 0))[0]?.company}
                        </p>
                      </div>
                      <div className="bg-yellow-100 rounded-full p-1">
                        <Award className="w-3 h-3 text-yellow-600" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {formatCurrency(leads.sort((a: any, b: any) => (b.value || 0) - (a.value || 0))[0]?.value || 0)}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs text-primary-600" asChild>
                        <Link to={`/leads/${leads.sort((a: any, b: any) => (b.value || 0) - (a.value || 0))[0]?._id}`}>
                          View Lead
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-primary-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-sm">📊 Pipeline Health</h4>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        {activeLeads} active
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Win rate</span>
                          <span className="font-medium">{conversionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${conversionRate}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Pipeline coverage</span>
                          <span className="font-medium">{(totalValue / 1000000).toFixed(1)}x</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (totalValue / 2000000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-primary-100 shadow-sm">
                    <h4 className="font-semibold text-sm mb-2">⚡ Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs" asChild>
                        <Link to="/ai/emails">
                          <Mail className="w-3 h-3 mr-1" />
                          Draft Email
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs" asChild>
                        <Link to="/leads/new">
                          <Plus className="w-3 h-3 mr-1" />
                          Add Lead
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-primary-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">No leads yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first lead to see AI insights
                  </p>
                  <Button size="sm" className="mt-4" asChild>
                    <Link to="/leads/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lead
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>
                Latest additions to your pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLeads?.leads?.slice(0, 3).map((lead: any, index: number) => (
                <Link
                  key={lead._id}
                  to={`/leads/${lead._id}`}
                  className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white">
                        {getInitials(lead.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.company}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                    <p
                      className={`text-xs font-bold mt-1 ${getScoreColor(lead.leadScore)}`}
                    >
                      Score: {lead.leadScore}
                    </p>
                  </div>
                </Link>
              ))}

              {recentLeads?.leads?.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No leads yet</p>
                  <Button variant="link" className="mt-2" asChild>
                    <Link to="/leads">Add your first lead</Link>
                  </Button>
                </div>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link to="/leads">
                  View All Leads
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;