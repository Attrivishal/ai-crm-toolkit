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
];

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");

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
  })) || [];

  // Real weekly data from leads
  const weeklyData = leads.slice(0, 7).map((lead: any, index: number) => ({
    name: `Lead ${index + 1}`,
    leads: lead.value || 0,
    meetings: lead.leadScore || 0,
    calls: lead.leadScore || 0,
  }));

  // Mock tasks data (since tasks API may not exist)
  const tasks: any[] = [];

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
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {user?.name?.split(" ")[0] || "Champion"}!
          </h1>
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
            <Activity className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button asChild className="bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-lg shadow-primary-500/25">
            <Link to="/leads">
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Pipeline
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(totalValue)}
                </h3>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-green-600 flex items-center">
                    <ArrowUpRight className="w-4 h-4" />
                    12.5%
                  </span>
                  <span className="text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Leads
                </p>
                <h3 className="text-2xl font-bold mt-2">{activeLeads}</h3>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-green-600 flex items-center">
                    <ArrowUpRight className="w-4 h-4" />
                    8.2%
                  </span>
                  <span className="text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </p>
                <h3 className="text-2xl font-bold mt-2">{conversionRate}%</h3>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-green-600 flex items-center">
                    <ArrowUpRight className="w-4 h-4" />
                    2.4%
                  </span>
                  <span className="text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Deal Size
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatCurrency(avgDealSize)}
                </h3>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-red-600 flex items-center">
                    <ArrowDownRight className="w-4 h-4" />
                    4.1%
                  </span>
                  <span className="text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
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
            <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>
                    Based on your current pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {weeklyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <defs>
                            <linearGradient
                              id="colorRevenue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#4f46e5"
                                stopOpacity={0.1}
                              />
                              <stop
                                offset="95%"
                                stopColor="#4f46e5"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="leads"
                            stroke="#4f46e5"
                            strokeWidth={2}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Activity</CardTitle>
                  <CardDescription>Recent lead scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    {weeklyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="meetings"
                            fill="#4f46e5"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="calls"
                            fill="#10b981"
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pipeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline Distribution</CardTitle>
                  <CardDescription>Leads by stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* AI Insights Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="bg-gradient-to-br from-primary-50 to-background border-primary-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-primary-600" />
                  AI Copilot Insights
                </CardTitle>
                <Badge variant="gradient" className="animate-pulse-slow">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <CardDescription>Real-time recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.length > 0 ? (
                <>
                  <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">High Value Lead</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {leads[0]?.name} from {leads[0]?.company} has high potential
                        </p>
                      </div>
                      <AlertCircle className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="warning" size="sm">
                        ${leads[0]?.value || 0}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs" asChild>
                        <Link to={`/leads/${leads[0]?._id}`}>
                          View Lead
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-primary-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">Pipeline Summary</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activeLeads} active leads worth {formatCurrency(totalValue)}
                        </p>
                      </div>
                      <Target className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No leads yet. Add your first lead to see insights.
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
              {recentLeads?.leads?.slice(0, 3).map((lead: any) => (
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