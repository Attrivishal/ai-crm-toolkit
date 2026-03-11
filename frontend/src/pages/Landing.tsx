import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
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
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  ArrowRight,
  Menu,
  X,
  PlayCircle,
  Database,
  LineChart,
  PieChart,
  Rocket,
  Lock,
  Cloud,
  Github,
  Slack,
  Chrome,
  Linkedin,
  Layers,
  Workflow,
  Gauge,
  Brain,
  Award,
  Phone,
  Video,
  MessageSquare,
  Calendar,
  Download,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin as LinkedinIcon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      title: "AI Lead Scoring",
      desc: "Instantly identify which leads are ready to buy with signal-based scoring.",
      icon: Target,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Smart Outreach",
      desc: "Generate hyper-personalized emails that actually get replies, in seconds.",
      icon: Mail,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Risk Prediction",
      desc: "Identify deal blockers and churn patterns before they impact revenue.",
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Meeting Summaries",
      desc: "Never take notes again. Get structured intelligence from every transcript.",
      icon: FileText,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Pipeline Analytics",
      desc: "Real-time insights into your sales pipeline with predictive forecasting.",
      icon: BarChart3,
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "AI Copilot",
      desc: "A 24/7 sales assistant that stays in context with all your deals.",
      icon: Bot,
      color: "from-violet-500 to-purple-500",
    },
  ];

  const stats = [
    { value: "45%", label: "Faster Close Rate", icon: TrendingUp },
    { value: "12k+", label: "Active Teams", icon: Users },
    { value: "3x", label: "Pipeline Velocity", icon: Zap },
    { value: "85%", label: "Prediction Accuracy", icon: Sparkles },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Connect Your CRM",
      description: "Sync with Salesforce, HubSpot, or any CRM in minutes",
      icon: Database,
    },
    {
      step: "02",
      title: "AI Analyzes Pipeline",
      description: "Our AI analyzes deal signals, engagement data, and historical patterns",
      icon: Brain,
    },
    {
      step: "03",
      title: "Get Actionable Insights",
      description: "Receive real-time alerts, risk predictions, and next-step recommendations",
      icon: Gauge,
    },
    {
      step: "04",
      title: "Close More Deals",
      description: "Act on AI insights to increase win rates and accelerate deals",
      icon: Rocket,
    },
  ];

  const integrations = [
    { name: "Salesforce", icon: Cloud },
    { name: "HubSpot", icon: Cloud },
    { name: "Slack", icon: Slack },
    { name: "Google Meet", icon: Video },
    { name: "Zoom", icon: Video },
    { name: "Microsoft Teams", icon: Users },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 100 leads/month",
        "Email generator",
        "Proposal generator",
        "Basic analytics",
        "Community support",
      ],
      cta: "Start Free",
      popular: false,
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
        "Meeting summaries",
        "Priority support",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Team management",
        "Advanced security",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "VP of Sales, TechCorp",
      content: "PipelineIQ has transformed how our team operates. We've seen a 45% increase in conversion rates within the first month.",
      avatar: "https://i.pravatar.cc/150?u=1",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Sales Director, InnovateLabs",
      content: "The AI-powered insights have helped us identify opportunities we were missing. It's like having a superpower.",
      avatar: "https://i.pravatar.cc/150?u=2",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Enterprise AE, GlobalTech",
      content: "The email generator alone saves me hours every week. The AI understands our tone and context perfectly.",
      avatar: "https://i.pravatar.cc/150?u=3",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              PipelineIQ
            </span>
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 ml-2">
              Beta
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#product" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Product
            </a>
            <a href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600"
            >
              Start Free Trial
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-card border-b border-border p-4"
          >
            <div className="flex flex-col space-y-4">
              <a href="#product" className="text-sm font-medium hover:text-primary">Product</a>
              <a href="#solutions" className="text-sm font-medium hover:text-primary">Solutions</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary">Pricing</a>
              <a href="#docs" className="text-sm font-medium hover:text-primary">Docs</a>
              <a href="#contact" className="text-sm font-medium hover:text-primary">Contact</a>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse-slow px-4 py-1">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI-Powered Sales Intelligence
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Transform Your Sales
              <span className="block bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                With AI Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              PipelineIQ analyzes millions of data points to predict outcomes,
              automate outreach, and guide your team to victory.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="xl" 
                onClick={() => navigate('/signup')} 
                className="group bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                onClick={() => navigate('/login')}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                View Product Demo
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  Trusted by 12,000+ sales teams
                </span>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-12 bg-muted/50 border-b border-border flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning-500" />
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                </div>
              </div>
              <div className="p-6">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                  alt="Dashboard Preview"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-indigo-600">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" size="lg">How It Works</Badge>
            <h2 className="text-4xl font-bold">From Data to Deals in Four Steps</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI transforms your sales data into actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-transparent" />
                  )}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <Badge variant="outline" className="mb-2">{step.step}</Badge>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" size="lg">Powerful Features</Badge>
            <h2 className="text-4xl font-bold">Everything you need to close deals faster</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              AI-powered tools that automate the mundane and amplify your team's selling power
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" size="lg">Integrations</Badge>
            <h2 className="text-4xl font-bold">Works with your favorite tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Seamlessly integrate with your existing sales stack
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md transition-all"
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-indigo-600" />
                  <p className="text-sm font-medium">{integration.name}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" size="lg">Pricing</Badge>
            <h2 className="text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that's right for your team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <Card className={`h-full ${plan.popular ? 'border-indigo-500 shadow-xl' : ''}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white' 
                          : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => navigate('/signup')}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" size="lg">Testimonials</Badge>
            <h2 className="text-4xl font-bold">Loved by sales teams everywhere</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what our customers have to say about PipelineIQ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" size="lg">Enterprise Security</Badge>
            <h2 className="text-4xl font-bold">Your data is safe with us</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enterprise-grade security and compliance built into every layer
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: "Encrypted Data", desc: "256-bit encryption at rest and in transit" },
              { icon: Shield, title: "Role-based Access", desc: "Granular permissions for your team" },
              { icon: Cloud, title: "Secure Cloud", desc: "Hosted on AWS with SOC2 compliance" },
              { icon: CheckCircle2, title: "GDPR Compliant", desc: "Fully compliant with data regulations" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-bold">Ready to transform your sales process?</h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of sales teams using AI to close more deals in less time
              </p>
              <Button
                size="xl"
                variant="secondary"
                onClick={() => navigate('/signup')}
                className="bg-white text-indigo-600 hover:bg-white/90"
              >
                Start Your Free Trial
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-white/80">No credit card required • 14-day free trial</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  PipelineIQ
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered sales intelligence platform for modern sales teams
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Slack className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 PipelineIQ. All rights reserved. Made with AI for modern sales teams.</p>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          onClick={() => navigate('/signup')}
          className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Free Trial
        </Button>
      </motion.div>
    </div>
  );
};

export default Landing;