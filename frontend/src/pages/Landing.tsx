import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  TrendingUp,
  Bot,
  ChevronRight,
  Zap,
  BarChart3,
  Mail,
  Target,
  Shield,
  AlertCircle,
  Sparkles,
  FileText,
  Users,
  TrendingDown,
  Clock,
  CheckCircle2,
  Star,
  ArrowRight,
  Menu,
  X,
  PlayCircle,
  Database,
  Rocket,
  Lock,
  Cloud,
  Github,
  Slack,
  Linkedin,
  Twitter,
  HelpCircle,
  Briefcase,
  DollarSign,
  Activity,
  Layers,
  Workflow,
  Gauge,
  Brain,
  Award,
  MessageSquare,
  PieChart,
  LineChart,
  ShieldCheck,
  ZapOff,
  AlertTriangle,
  Calendar,
  BellRing,
  Settings,
  UserPlus,
  Upload,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Phone,
  Video,
  Send,
  ThumbsUp,
  Share2,
  BookOpen,
  Globe,
  Heart,
  Flag,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  LogOut,
  Copy,
  Edit3,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// Deal data type for backend integration
interface DealData {
  totalDeals: number;
  totalDealsChange: number;
  winRate: number;
  winRateChange: number;
  revenue: number;
  revenueChange: number;
  pipelineStages: {
    qualification: { count: number; value: number; progress: number };
    meeting: { count: number; value: number; progress: number };
    proposal: { count: number; value: number; progress: number };
    negotiation: { count: number; value: number; progress: number };
  };
  aiInsights: {
    staleDealsCount: number;
    staleDealsStage: string;
    staleDays: number;
  };
}

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  // Real data states
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attio-style background transformations
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.3, 0.6, 1],
    ["#ffffff", "#f8faff", "#1a1f2e", "#0a0c12"],
  );

  const textColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#111827", "#111827", "#ffffff"],
  );

  const navbarBg = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.8)", "rgba(255,255,255,0.95)"],
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Fetch real deal data from backend
  const fetchDealData = async () => {
    try {
      setLoading(true);
      console.log("Fetching leads with token...");

      // Get token from localStorage (if available)
      let token = localStorage.getItem("pipelineiq_token");

      // If no token in localStorage, try to login
      if (!token) {
        try {
          console.log("No token found, logging in...");
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
          const loginResponse = await fetch(
            `${API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: "vishalattri196@gmail.com",
                password: "Vishal@2006",
              }),
            },
          );

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            token = loginData.token;
            // Store token in localStorage
            localStorage.setItem("pipelineiq_token", token);
            console.log("New token obtained and stored");
          }
        } catch (loginErr) {
          console.error("Login failed:", loginErr);
        }
      }

      // If still no token, use fallback
      if (!token) {
        throw new Error("No authentication token available");
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      // If token expired (401), clear it and use fallback
      if (response.status === 401) {
        localStorage.removeItem("pipelineiq_token");
        throw new Error("Token expired. Please refresh the page.");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Leads data received:", data);

      // Extract leads array from response
      const leads = data.leads || [];

      if (leads.length > 0) {
        const totalDeals = leads.length;

        // Count leads by status/stage
        const qualification = leads.filter(
          (lead: any) =>
            lead.status === "New Lead" ||
            lead.status === "New" ||
            lead.status === "Qualification",
        ).length;

        const meeting = leads.filter(
          (lead: any) =>
            lead.status === "Demo Scheduled" ||
            lead.status === "Meeting Scheduled" ||
            lead.status === "Contacted",
        ).length;

        const proposal = leads.filter(
          (lead: any) =>
            lead.status === "Proposal Sent" ||
            lead.status === "Proposal" ||
            lead.status === "Negotiation",
        ).length;

        const negotiation = leads.filter(
          (lead: any) =>
            lead.status === "Closing" ||
            lead.status === "Final" ||
            lead.status === "Closed Won" ||
            lead.status === "Closed Lost",
        ).length;

        // Calculate total revenue
        const totalRevenue = leads.reduce((sum: number, lead: any) => {
          return sum + (lead.value || 0);
        }, 0);

        // Calculate revenue by stage
        const qualRevenue = leads
          .filter(
            (lead: any) => lead.status === "New Lead" || lead.status === "New",
          )
          .reduce((sum: number, lead: any) => sum + (lead.value || 0), 0);

        const meetingRevenue = leads
          .filter(
            (lead: any) =>
              lead.status === "Demo Scheduled" ||
              lead.status === "Meeting Scheduled",
          )
          .reduce((sum: number, lead: any) => sum + (lead.value || 0), 0);

        const proposalRevenue = leads
          .filter((lead: any) => lead.status === "Proposal Sent")
          .reduce((sum: number, lead: any) => sum + (lead.value || 0), 0);

        const negotiationRevenue = leads
          .filter(
            (lead: any) =>
              lead.status === "Closing" ||
              lead.status === "Closed Won" ||
              lead.status === "Closed Lost",
          )
          .reduce((sum: number, lead: any) => sum + (lead.value || 0), 0);

        // Calculate win rate (Closed Won vs total)
        const wonLeads = leads.filter(
          (lead: any) => lead.status === "Closed Won",
        ).length;
        const winRate =
          totalDeals > 0 ? Math.round((wonLeads / totalDeals) * 100) : 0;

        // Find stale deals (not updated in 5+ days)
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const staleNegotiationDeals = leads.filter((lead: any) => {
          const isNegotiation =
            lead.status === "Closing" ||
            lead.status === "Final" ||
            lead.status === "Proposal Sent";
          const updatedAt = new Date(lead.updatedAt || lead.createdAt);
          return isNegotiation && updatedAt < fiveDaysAgo;
        }).length;

        setDealData({
          totalDeals: totalDeals,
          totalDealsChange: 12,
          winRate: winRate,
          winRateChange: 5,
          revenue: totalRevenue,
          revenueChange: 18,
          pipelineStages: {
            qualification: {
              count: qualification,
              value: qualRevenue,
              progress: Math.round((qualification / totalDeals) * 100) || 80,
            },
            meeting: {
              count: meeting,
              value: meetingRevenue,
              progress: Math.round((meeting / totalDeals) * 100) || 65,
            },
            proposal: {
              count: proposal,
              value: proposalRevenue,
              progress: Math.round((proposal / totalDeals) * 100) || 45,
            },
            negotiation: {
              count: negotiation,
              value: negotiationRevenue,
              progress: Math.round((negotiation / totalDeals) * 100) || 25,
            },
          },
          aiInsights: {
            staleDealsCount: staleNegotiationDeals,
            staleDealsStage: "Negotiation",
            staleDays: 5,
          },
        });

        setError(null);
        console.log("Deal data updated with real leads:", leads);
      } else {
        throw new Error("No leads found");
      }
    } catch (err) {
      console.error("Error fetching deal data:", err);
      setError(`Failed to load real data: ${err.message}. Using fallback.`);

      // Fallback data
      setDealData({
        totalDeals: 156,
        totalDealsChange: 12,
        winRate: 68,
        winRateChange: 5,
        revenue: 2400000,
        revenueChange: 18,
        pipelineStages: {
          qualification: { count: 42, value: 840000, progress: 80 },
          meeting: { count: 38, value: 760000, progress: 65 },
          proposal: { count: 24, value: 480000, progress: 45 },
          negotiation: { count: 12, value: 320000, progress: 25 },
        },
        aiInsights: {
          staleDealsCount: 3,
          staleDealsStage: "Negotiation",
          staleDays: 5,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and refresh every 5 minutes
  useEffect(() => {
    fetchDealData();

    const interval = setInterval(fetchDealData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Animated counter component
  const Counter = ({
    end,
    duration = 2000,
  }: {
    end: number;
    duration?: number;
  }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <span>{count.toLocaleString()}+</span>;
  };

  return (
    <motion.div
      className="min-h-screen transition-colors duration-1000 relative"
      style={{ backgroundColor }}
    >
      {/* Attio-style gradient overlays that change with scroll */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: useTransform(
            scrollYProgress,
            [0, 0.3, 0.6, 1],
            [
              "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.03) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.03) 0%, transparent 40%)",
              "radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.06) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(99, 102, 241, 0.06) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 60%), radial-gradient(circle at 60% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
            ],
          ),
        }}
      />

      {/* Floating particles effect (Attio style) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-200/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, -30, 30, -30],
              x: [null, 30, -30, 30],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Navigation - Attio style with blur and dynamic background */}
      <motion.nav
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          backgroundColor: navbarBg,
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
          borderBottom: scrolled
            ? "1px solid rgba(0,0,0,0.05)"
            : "1px solid transparent",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Fixed spacing */}
            <motion.div
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="6" cy="12" r="4" fill="white" />
                    <circle cx="12" cy="12" r="4" fill="white" />
                    <circle cx="18" cy="12" r="4" fill="white" />
                    <line
                      x1="10"
                      y1="12"
                      x2="14"
                      y2="12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.div>
                <motion.span
                  className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                >
                  PipelineIQ
                </motion.span>
              </div>
              {/* Beta badge with proper spacing and animation */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <Badge
                  variant="outline"
                  className="ml-2 md:ml-3 px-3 md:px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200 rounded-full shadow-sm"
                >
                  <Sparkles className="w-3 h-3 mr-1.5 inline-block animate-pulse" />
                  Beta
                </Badge>
              </motion.div>
            </motion.div>

            {/* Desktop Navigation - Centered */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {[
                { id: "features", label: "Features", icon: Sparkles },
                { id: "how-it-works", label: "How it works", icon: Workflow },
                { id: "pricing", label: "Pricing", icon: DollarSign },
                {
                  id: "testimonials",
                  label: "Testimonials",
                  icon: MessageSquare,
                },
                { id: "faq", label: "FAQ", icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="relative px-3 lg:px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 rounded-lg group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center space-x-1.5">
                      <Icon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{item.label}</span>
                    </span>
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                );
              })}
            </div>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => navigate("/login")}
                  className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  Sign in
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Start free trial
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Mobile menu with animation */}
          <motion.div
            initial={false}
            animate={
              mobileMenuOpen
                ? { height: "auto", opacity: 1 }
                : { height: 0, opacity: 0 }
            }
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-4 border-t border-gray-200 space-y-1">
              {[
                { id: "features", label: "Features" },
                { id: "how-it-works", label: "How it works" },
                { id: "pricing", label: "Pricing" },
                { id: "testimonials", label: "Testimonials" },
                { id: "faq", label: "FAQ" },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="w-full px-3 py-3 text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                  whileHover={{ x: 5 }}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="w-full"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="w-full bg-indigo-600"
                >
                  Start free trial
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section - Attio Style with parallax */}
      <section className="relative pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-20 lg:pb-24 px-4 overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[800px] bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent -z-10"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]),
            y: useTransform(scrollYProgress, [0, 1], [0, -100]),
          }}
        />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-block"
              >
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-6 px-4 py-2 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
                  AI-Powered Deal Intelligence
                </Badge>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Know which deals will close{" "}
                <motion.span
                  className="text-indigo-600 relative inline-block"
                  initial={{ backgroundPosition: "0% 50%" }}
                  animate={{ backgroundPosition: "100% 50%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{
                    background:
                      "linear-gradient(90deg, #4f46e5, #818cf8, #4f46e5)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  before they do
                  <motion.svg
                    className="absolute -bottom-3 left-0 w-full"
                    viewBox="0 0 100 5"
                    preserveAspectRatio="none"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.8 }}
                  >
                    <motion.path
                      d="M0,5 L100,5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="text-indigo-300"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 1 }}
                    />
                  </motion.svg>
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                PipelineIQ analyzes your sales pipeline in real-time, identifies
                risky deals, and suggests the next action so your team closes
                more deals faster.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-8 md:mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={() => navigate("/signup")}
                    className="bg-indigo-600 hover:bg-indigo-700 px-8 h-14 text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    Get started free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => scrollToSection("how-it-works")}
                    className="px-8 h-14 text-base border-2 hover:bg-gray-50 w-full sm:w-auto"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Watch demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Social proof with counters */}
              <motion.div
                className="flex flex-wrap items-center gap-6 md:gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                    >
                      <Avatar className="w-10 h-10 border-2 border-white ring-2 ring-white shadow-lg">
                        <AvatarImage src={`https://i.pravatar.cc/100?u=${i}`} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          U{i}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  ))}
                  <motion.div
                    className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white ring-2 ring-white flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-xs font-bold text-indigo-600">
                      <Counter end={2000} />
                    </span>
                  </motion.div>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                  <motion.span
                    className="ml-2 text-sm text-gray-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    Rated 4.9 by sales teams
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right content - Dashboard preview with REAL DATA */}
            <motion.div
              initial={{ opacity: 0, x: 50, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />

              {/* Dashboard card */}
              <motion.div
                className="relative bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
                whileHover={{
                  y: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="h-12 bg-gray-50/80 border-b border-gray-200 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-gray-200/50 rounded-full text-xs text-gray-600">
                      pipelineiq.app/deals
                    </div>
                  </div>
                </div>

                {/* Dashboard content with REAL DATA */}
                <div className="p-6">
                  {/* Header with metrics */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Deal Pipeline
                    </h3>
                    <div className="flex space-x-2">
                      <motion.div
                        className="p-2 bg-indigo-50 rounded-lg"
                        whileHover={{ scale: 1.1, backgroundColor: "#e0e7ff" }}
                      >
                        <Filter className="w-4 h-4 text-indigo-600" />
                      </motion.div>
                      <motion.div
                        className="p-2 bg-gray-50 rounded-lg"
                        whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-600" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Stats grid - dynamic from backend */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {(dealData
                      ? [
                          {
                            label: "Total Deals",
                            value: dealData.totalDeals.toString(),
                            change: `+${dealData.totalDealsChange}%`,
                            icon: Briefcase,
                            color: "indigo",
                          },
                          {
                            label: "Win Rate",
                            value: `${dealData.winRate}%`,
                            change: `+${dealData.winRateChange}%`,
                            icon: Target,
                            color: "green",
                          },
                          {
                            label: "Revenue",
                            value: `$${(dealData.revenue / 1000000).toFixed(1)}M`,
                            change: `+${dealData.revenueChange}%`,
                            icon: TrendingUp,
                            color: "blue",
                          },
                        ]
                      : [
                          {
                            label: "Total Deals",
                            value: "...",
                            change: "...",
                            icon: Briefcase,
                            color: "indigo",
                          },
                          {
                            label: "Win Rate",
                            value: "...",
                            change: "...",
                            icon: Target,
                            color: "green",
                          },
                          {
                            label: "Revenue",
                            value: "...",
                            change: "...",
                            icon: TrendingUp,
                            color: "blue",
                          },
                        ]
                    ).map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={i}
                          className="p-3 bg-gray-50 rounded-xl"
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "#f9fafb",
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Icon
                              className={`w-4 h-4 text-${stat.color}-600`}
                            />
                            <span className="text-xs text-gray-500">
                              {stat.label}
                            </span>
                          </div>
                          <div className="flex items-end justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              {stat.value}
                            </span>
                            {stat.change !== "..." && (
                              <span className="text-xs text-green-600">
                                {stat.change}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Pipeline stages - dynamic from backend */}
                  {dealData && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          Pipeline stages
                        </span>
                        <span className="text-indigo-600">View all</span>
                      </div>

                      {[
                        {
                          stage: "Qualification",
                          ...dealData.pipelineStages.qualification,
                          color: "blue",
                        },
                        {
                          stage: "Meeting",
                          ...dealData.pipelineStages.meeting,
                          color: "indigo",
                        },
                        {
                          stage: "Proposal",
                          ...dealData.pipelineStages.proposal,
                          color: "purple",
                        },
                        {
                          stage: "Negotiation",
                          ...dealData.pipelineStages.negotiation,
                          color: "pink",
                        },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.stage}</span>
                            <span className="font-medium text-gray-900">
                              {item.count} deals
                            </span>
                          </div>
                          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className={`absolute left-0 top-0 h-full bg-${item.color}-500 rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 1, delay: 1 + i * 0.1 }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              Value: ${(item.value / 1000).toFixed(0)}K
                            </span>
                            <span>{item.progress}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* AI insights - dynamic from backend */}
                  {dealData && (
                    <motion.div
                      className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Brain className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            AI Insight
                          </p>
                          <p className="text-xs text-gray-600">
                            {dealData.aiInsights.staleDealsCount} deals in "
                            {dealData.aiInsights.staleDealsStage}" stage haven't
                            been updated in {dealData.aiInsights.staleDays}+
                            days.
                            <span className="text-indigo-600 ml-1 cursor-pointer">
                              Take action →
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust bar with infinite scroll */}
      <section className="py-12 border-y border-gray-200 bg-gray-50/50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-8">
            Trusted by innovative sales teams
          </p>
          <div className="relative">
            <motion.div
              className="flex space-x-12 md:space-x-16"
              animate={{
                x: [0, -1000],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...Array(2)].map((_, groupIndex) => (
                <div key={groupIndex} className="flex space-x-12 md:space-x-16">
                  {[
                    { name: "Salesforce", icon: Cloud },
                    { name: "HubSpot", icon: Zap },
                    { name: "Slack", icon: MessageSquare },
                    { name: "Gong", icon: BellRing },
                    { name: "ZoomInfo", icon: Users },
                    { name: "Outreach", icon: Send },
                    { name: "Salesloft", icon: TrendingUp },
                    { name: "Clari", icon: BarChart3 },
                  ].map((company, i) => {
                    const Icon = company.icon;
                    return (
                      <motion.div
                        key={`${groupIndex}-${i}`}
                        className="flex items-center space-x-2 opacity-40 hover:opacity-60 transition-opacity cursor-default"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="w-5 h-5 text-gray-700" />
                        <span className="text-sm font-medium text-gray-700">
                          {company.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section id="problem" className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
              The problem
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Sales teams lose deals for{" "}
              <span className="text-indigo-600 relative">
                simple reasons
                <motion.div
                  className="absolute -bottom-2 left-0 w-full h-1 bg-indigo-200/50 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deals don't fail because of bad products. They fail because teams
              miss signals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertCircle,
                title: "Leads are not prioritized",
                desc: "Your team spends time on cold leads while hot opportunities wait.",
                color: "red",
                stats: "67% of leads are never followed up",
              },
              {
                icon: Clock,
                title: "Follow-ups are missed",
                desc: "Important deals go cold because no one followed up on time.",
                color: "orange",
                stats: "55% of deals lost due to poor follow-up",
              },
              {
                icon: TrendingDown,
                title: "Deals suddenly go cold",
                desc: "You lose deals without warning because you missed early signals.",
                color: "red",
                stats: "73% of deals show warning signs before closing",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl group h-full">
                    <CardContent className="p-8">
                      <motion.div
                        className={`w-14 h-14 bg-${item.color}-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 5 }}
                      >
                        <Icon className={`w-7 h-7 text-${item.color}-600`} />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {item.desc}
                      </p>
                      <div className="text-sm font-medium text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-full">
                        {item.stats}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solution / How it works */}
      <section
        id="how-it-works"
        className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
              How PipelineIQ works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              From pipeline to{" "}
              <span className="text-indigo-600">closed deal</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to transform your sales process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line with animation */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{ originX: 0 }}
              />
            </div>

            {[
              {
                step: 1,
                title: "Connect",
                desc: "Sync your CRM or import leads",
                icon: Database,
                color: "indigo",
              },
              {
                step: 2,
                title: "Analyze",
                desc: "AI analyzes deal signals and patterns",
                icon: Brain,
                color: "purple",
              },
              {
                step: 3,
                title: "Identify",
                desc: "Get real-time risk alerts",
                icon: Target,
                color: "pink",
              },
              {
                step: 4,
                title: "Act",
                desc: "Take action and close more deals",
                icon: Rocket,
                color: "orange",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  className="relative text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <motion.div
                    className="w-20 h-20 bg-white rounded-2xl border-2 border-indigo-200 flex items-center justify-center mx-auto mb-6 group-hover:border-indigo-600 group-hover:shadow-xl transition-all relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className={`w-10 h-10 text-${item.color}-600`} />
                  </motion.div>
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.5 + i * 0.1 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Feature highlight */}
          <motion.div
            className="mt-20 grid md:grid-cols-2 gap-8 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Real-time pipeline intelligence
              </h3>
              <p className="text-gray-600 mb-6">
                Our AI continuously analyzes your deals, identifying patterns
                and risks that human eyes might miss.
              </p>
              <ul className="space-y-3">
                {[
                  "Instant risk detection",
                  "Automated follow-up reminders",
                  "Deal stage predictions",
                  "Competitive intelligence",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI Assistant</p>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      ⚠️ 3 deals in negotiation stage are at risk of closing
                      this week
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      💡 Follow up with Acme Corp - they viewed pricing page 5
                      times
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything you need to{" "}
              <span className="text-indigo-600">win more deals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI-powered tools that automate the mundane and amplify your team's
              selling power
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI Lead Scoring",
                desc: "Identify which leads are most likely to convert based on engagement signals and deal patterns.",
                icon: Target,
                color: "blue",
                metric: "89% accuracy",
              },
              {
                title: "Email Generator",
                desc: "Create personalized sales emails instantly using AI trained on your winning messages.",
                icon: Mail,
                color: "green",
                metric: "10x faster",
              },
              {
                title: "Meeting Intelligence",
                desc: "Turn meeting transcripts into actionable insights and next steps automatically.",
                icon: MessageSquare,
                color: "purple",
                metric: "100+ insights/day",
              },
              {
                title: "Deal Risk Prediction",
                desc: "Detect deals that might fail before it's too late with AI-powered risk analysis.",
                icon: AlertCircle,
                color: "orange",
                metric: "85% early detection",
              },
              {
                title: "Pipeline Analytics",
                desc: "See exactly where your pipeline is strong and where it needs attention.",
                icon: BarChart3,
                color: "indigo",
                metric: "Real-time",
              },
              {
                title: "AI Copilot",
                desc: "Get real-time suggestions for your next best action on every deal.",
                icon: Bot,
                color: "pink",
                metric: "24/7 assistance",
              },
              {
                title: "Competitive Intel",
                desc: "Track competitor mentions and get alerts when you're at risk of losing to competitors.",
                icon: Shield,
                color: "red",
                metric: "Real-time alerts",
              },
              {
                title: "Forecasting",
                desc: "Accurate revenue forecasts based on AI analysis of your pipeline health.",
                icon: TrendingUp,
                color: "cyan",
                metric: "95% accuracy",
              },
              {
                title: "Team Performance",
                desc: "Track individual and team performance metrics with AI-powered insights.",
                icon: Users,
                color: "yellow",
                metric: "Key metrics",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all group h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div
                          className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                          whileHover={{ rotate: 5 }}
                        >
                          <Icon
                            className={`w-6 h-6 text-${feature.color}-600`}
                          />
                        </motion.div>
                        <Badge
                          variant="secondary"
                          className="bg-indigo-50 text-indigo-600 border-0"
                        >
                          {feature.metric}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Loved by sales teams{" "}
              <span className="text-indigo-600">everywhere</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "VP of Sales, TechCorp",
                content:
                  "45% increase in conversion rates within the first month. The AI insights are game-changing.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?u=1",
                company: "TechCorp",
                metric: "+45% conversion",
              },
              {
                name: "Michael Chen",
                role: "Sales Director, InnovateLabs",
                content:
                  "The AI insights helped us identify opportunities we were missing. It's like having a superpower.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?u=2",
                company: "InnovateLabs",
                metric: "$2.1M pipeline growth",
              },
              {
                name: "Emily Rodriguez",
                role: "Enterprise AE, GlobalTech",
                content:
                  "Saves me hours every week. The email generator alone is worth the subscription.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?u=3",
                company: "GlobalTech",
                metric: "10+ hours saved/week",
              },
              {
                name: "David Kim",
                role: "CEO, GrowthStack",
                content:
                  "Finally a CRM that actually helps us sell instead of just tracking. The AI insights are incredible.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?u=4",
                company: "GrowthStack",
                metric: "3x ROI",
              },
              {
                name: "Lisa Thompson",
                role: "Sales Ops, CloudScale",
                content:
                  "Implementation was smooth and the team loves it. Best decision we made this year.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?u=5",
                company: "CloudScale",
                metric: "100% adoption",
              },
              {
                name: "James Wilson",
                role: "Founder, SaaSFlow",
                content:
                  "Our forecast accuracy improved dramatically. We actually trust our numbers now.",
                rating: 5,
                avatar: "https://i.pravatar.cc/150?u=6",
                company: "SaaSFlow",
                metric: "95% forecast accuracy",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-gray-200 hover:border-indigo-200 transition-all h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-600 border-indigo-200"
                      >
                        {testimonial.metric}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 ring-2 ring-indigo-100">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          {testimonial.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Company logos */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-sm text-gray-500 mb-8">
              Trusted by 2,000+ companies
            </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { name: 'Salesforce', color: 'text-blue-600' },
              { name: 'HubSpot', color: 'text-orange-500' },
              { name: 'Slack', color: 'text-purple-600' },
              { name: 'ZoomInfo', color: 'text-green-600' },
              { name: 'Outreach', color: 'text-red-500' },
              { name: 'Clari', color: 'text-indigo-600' }
            ].map((company, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <span className={`text-lg font-semibold ${company.color}`}>
                  {company.name}
                </span>
              </motion.div>
            ))}
          </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Simple, transparent{" "}
              <span className="text-indigo-600">pricing</span>
            </h2>
            <p className="text-xl text-gray-600">
              No hidden fees. Cancel anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$0",
                description: "For individuals and small teams",
                features: [
                  "100 leads/month",
                  "Email generator",
                  "Basic analytics",
                  "1 user",
                  "Email support",
                ],
                cta: "Start free",
                popular: false,
                icon: Rocket,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/month",
                description: "For growing sales teams",
                features: [
                  "Unlimited leads",
                  "AI risk prediction",
                  "Pipeline analytics",
                  "Priority support",
                  "5 users",
                  "Custom fields",
                  "API access",
                ],
                cta: "Start trial",
                popular: true,
                icon: Zap,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations",
                features: [
                  "Everything in Pro",
                  "Team management",
                  "Custom integrations",
                  "Dedicated support",
                  "Unlimited users",
                  "SLA guarantee",
                  "SSO/SAML",
                ],
                cta: "Contact sales",
                popular: false,
                icon: Shield,
              },
            ].map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card
                    className={`relative border-2 transition-all hover:shadow-2xl h-full ${
                      plan.popular
                        ? "border-indigo-600 shadow-xl scale-105 z-10"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {plan.popular && (
                      <motion.div
                        className="absolute -top-4 left-1/2 -translate-x-1/2"
                        initial={{ y: -10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                      >
                        <Badge className="bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg">
                          Most popular
                        </Badge>
                      </motion.div>
                    )}
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {plan.name}
                        </h3>
                        <div
                          className={`p-3 rounded-xl bg-${plan.popular ? "indigo" : "gray"}-100`}
                        >
                          <Icon
                            className={`w-6 h-6 text-${plan.popular ? "indigo" : "gray"}-600`}
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-gray-500 ml-1">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, j) => (
                          <motion.li
                            key={j}
                            className="flex items-center text-sm text-gray-600"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + j * 0.05 }}
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-3 shrink-0" />
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className={`w-full h-12 text-base ${
                            plan.popular
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-white text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50"
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => navigate("/signup")}
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Money-back guarantee */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-green-500" />
              <span>30-day money-back guarantee. No questions asked.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 rounded-full">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Frequently asked{" "}
              <span className="text-indigo-600">questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "How does the AI work?",
                a: "Our AI analyzes thousands of data points from your deals - engagement signals, email responses, meeting frequency, competitor mentions, and historical patterns to predict outcomes and suggest next actions.",
              },
              {
                q: "Can I import my existing CRM data?",
                a: "Yes! We have one-click imports from Salesforce, HubSpot, and Pipedrive. You can also upload CSV files or use our API for custom integrations.",
              },
              {
                q: "Is my data secure?",
                a: "Absolutely. We use enterprise-grade encryption, are SOC2 compliant, and never share your data. You can enable SSO and enforce 2FA for additional security.",
              },
              {
                q: "What support do you offer?",
                a: "All plans include email support. Pro plans get priority support, and Enterprise includes a dedicated account manager and 24/7 phone support.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel or change your plan at any time. No long-term contracts required. We also offer a 30-day money-back guarantee.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="border-gray-200 hover:border-indigo-200 transition-all">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-gray-600">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-0 -right-4 w-96 h-96 bg-white rounded-full"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Start closing more deals today
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Start closing deals with AI insights
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of sales teams using AI to close more deals in less
              time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 h-14 text-base shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                >
                  Get started free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("how-it-works")}
                  className="bg-transparent text-white border-white hover:bg-white/10 px-8 h-14 text-base w-full sm:w-auto"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch demo
                </Button>
              </motion.div>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-4 text-indigo-100">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="w-1 h-1 bg-indigo-300 rounded-full" />
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">14-day free trial</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="6" cy="12" r="4" fill="white" />
                    <circle cx="12" cy="12" r="4" fill="white" />
                    <circle cx="18" cy="12" r="4" fill="white" />
                    <line
                      x1="10"
                      y1="12"
                      x2="14"
                      y2="12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  PipelineIQ
                </span>
                <Badge className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                  Beta
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4 max-w-xs">
                AI-powered deal intelligence for modern sales teams. Close more
                deals, faster.
              </p>
              <div className="flex space-x-4">
                {/* Twitter - opens in new tab */}
                <motion.a
                  href="https://twitter.com/pipelineiq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  whileHover={{ scale: 1.2, y: -2 }}
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>

                {/* LinkedIn - opens in new tab */}
                <motion.a
                  href="https://linkedin.com/company/pipelineiq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  whileHover={{ scale: 1.2, y: -2 }}
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>

                {/* GitHub - opens in new tab */}
                <motion.a
                  href="https://github.com/pipelineiq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  whileHover={{ scale: 1.2, y: -2 }}
                  aria-label="View our GitHub"
                >
                  <Github className="w-5 h-5" />
                </motion.a>

                {/* Slack Community - opens in new tab */}
                <motion.a
                  href="https://pipelineiq.slack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  whileHover={{ scale: 1.2, y: -2 }}
                  aria-label="Join our Slack community"
                >
                  <Slack className="w-5 h-5" />
                </motion.a>
              </div>
            </div>

            {/* Product Links - Internal pages */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="#features"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("features");
                    }}
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Features
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="#pricing"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("pricing");
                    }}
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    Pricing
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/integrations"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/integrations");
                    }}
                  >
                    Integrations
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/api-docs"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open("https://docs.pipelineiq.com", "_blank");
                    }}
                  >
                    API
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/changelog"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/changelog");
                    }}
                  >
                    Changelog
                  </a>
                </motion.li>
              </ul>
            </div>

            {/* Resources Links - External/Internal mix */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2">
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="https://docs.pipelineiq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Documentation
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/blog"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/blog");
                    }}
                  >
                    Blog
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/guides"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/guides");
                    }}
                  >
                    Guides
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/webinars"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/webinars");
                    }}
                  >
                    Webinars
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/case-studies"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/case-studies");
                    }}
                  >
                    Case Studies
                  </a>
                </motion.li>
              </ul>
            </div>

            {/* Company Links - Internal/External mix */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/about"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/about");
                    }}
                  >
                    About
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/careers"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/careers");
                    }}
                  >
                    Careers
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/contact"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/contact");
                    }}
                  >
                    Contact
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/press"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/press");
                    }}
                  >
                    Press
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 3 }}>
                  <a
                    href="/partners"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/partners");
                    }}
                  >
                    Partners
                  </a>
                </motion.li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2026 PipelineIQ. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/privacy"
                className="hover:text-indigo-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/privacy");
                }}
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-indigo-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/terms");
                }}
              >
                Terms
              </a>
              <a
                href="/security"
                className="hover:text-indigo-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/security");
                }}
              >
                Security
              </a>
              <a
                href="/cookies"
                className="hover:text-indigo-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/cookies");
                }}
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default Landing;
