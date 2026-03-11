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
  Rocket,
  Lock,
  Cloud,
  Github,
  Slack,
  Linkedin as LinkedinIcon,
  Twitter,
  HelpCircle,
  Briefcase,
  DollarSign,
  Activity,
  Filter,
  Calendar,
  MessageSquare,
  PieChart,
  LineChart,
  Layers,
  Workflow,
  Gauge,
  Brain,
  Award,
  TrendingDown,
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-indigo-600">PipelineIQ</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('problem')} className="text-sm text-gray-600 hover:text-indigo-600">Problem</button>
            <button onClick={() => scrollToSection('product')} className="text-sm text-gray-600 hover:text-indigo-600">Product</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-gray-600 hover:text-indigo-600">How it works</button>
            <button onClick={() => scrollToSection('features')} className="text-sm text-gray-600 hover:text-indigo-600">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm text-gray-600 hover:text-indigo-600">Pricing</button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>Log in</Button>
            <Button onClick={() => navigate('/signup')} className="bg-indigo-600 hover:bg-indigo-700">
              Start free trial
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col space-y-3">
              <button onClick={() => scrollToSection('problem')} className="text-left py-2 text-gray-600">Problem</button>
              <button onClick={() => scrollToSection('product')} className="text-left py-2 text-gray-600">Product</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 text-gray-600">How it works</button>
              <button onClick={() => scrollToSection('features')} className="text-left py-2 text-gray-600">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left py-2 text-gray-600">Pricing</button>
              <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2">
                <Button variant="outline" onClick={() => navigate('/login')}>Log in</Button>
                <Button onClick={() => navigate('/signup')} className="bg-indigo-600">Start free trial</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 mb-6">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              AI-Powered Deal Intelligence
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Know which deals will close<br />
              <span className="text-indigo-600">before they do</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              PipelineIQ analyzes your sales pipeline, identifies risky deals, and suggests the next action so your team closes more deals faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" onClick={() => navigate('/signup')} className="bg-indigo-600 hover:bg-indigo-700 px-8">
                Start free trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('product')}>
                <PlayCircle className="w-4 h-4 mr-2" />
                See how it works
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} className="w-full h-full rounded-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">Trusted by 500+ sales teams</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Bar */}
      <section className="py-12 border-y border-gray-200 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500 mb-6">Works with your existing tools</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <span className="text-lg font-semibold text-gray-400">Salesforce</span>
            <span className="text-lg font-semibold text-gray-400">HubSpot</span>
            <span className="text-lg font-semibold text-gray-400">Slack</span>
            <span className="text-lg font-semibold text-gray-400">Gmail</span>
            <span className="text-lg font-semibold text-gray-400">Notion</span>
            <span className="text-lg font-semibold text-gray-400">Zapier</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">The problem</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sales teams lose deals for simple reasons</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deals don't fail because of bad products. They fail because teams miss signals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Leads are not prioritized</h3>
                  <p className="text-gray-600 mt-1">Your team spends time on cold leads while hot opportunities wait.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Follow-ups are missed</h3>
                  <p className="text-gray-600 mt-1">Important deals go cold because no one followed up on time.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Deals suddenly go cold</h3>
                  <p className="text-gray-600 mt-1">You lose deals without warning because you missed the early signals.</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-8">
              <p className="text-lg font-medium text-indigo-900 mb-4">PipelineIQ fixes this by:</p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-indigo-900">Automatically scoring leads based on real engagement</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-indigo-900">Highlighting deals that need follow-up right now</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-indigo-900">Detecting risky deals before they fall through</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo Section */}
      <section id="product" className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Product demo</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">See PipelineIQ in action</h2>
          </div>

          <div className="space-y-24">
            {/* Feature 1 - Image left */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-48 bg-indigo-50 flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-indigo-600 opacity-50" />
                </div>
              </div>
              <div>
                <Badge className="bg-indigo-100 text-indigo-700 mb-4">AI Lead Scoring</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Know which leads to call first</h3>
                <p className="text-gray-600 text-lg">
                  PipelineIQ analyzes engagement signals and assigns lead scores so your team focuses on the best opportunities.
                </p>
              </div>
            </div>

            {/* Feature 2 - Image right */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Badge className="bg-indigo-100 text-indigo-700 mb-4">Deal Risk Detection</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Catch deals before they fail</h3>
                <p className="text-gray-600 text-lg">
                  AI detects deals that might fail based on activity signals, response delays, and pipeline patterns.
                </p>
              </div>
              <div className="order-1 md:order-2 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="h-48 bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-16 h-16 text-red-600 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How it works</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">From pipeline to closed deal in 4 steps</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Connect", desc: "Import your leads or connect your CRM" },
              { step: 2, title: "Analyze", desc: "AI analyzes deal activity and signals" },
              { step: 3, title: "Identify", desc: "Highlight risky and high-value opportunities" },
              { step: 4, title: "Act", desc: "Your team takes action and closes more deals" }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to win more deals</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Lead Scoring",
                desc: "Identify which leads are most likely to convert based on engagement signals and deal patterns.",
                icon: Target
              },
              {
                title: "Email Generator",
                desc: "Create personalized sales emails instantly using AI trained on your winning messages.",
                icon: Mail
              },
              {
                title: "Meeting Intelligence",
                desc: "Turn meeting transcripts into actionable insights and next steps automatically.",
                icon: FileText
              },
              {
                title: "Deal Risk Prediction",
                desc: "Detect deals that might fail before it's too late with AI-powered risk analysis.",
                icon: AlertCircle
              },
              {
                title: "Pipeline Analytics",
                desc: "See exactly where your pipeline is strong and where it needs attention.",
                icon: BarChart3
              },
              {
                title: "AI Copilot",
                desc: "Get real-time suggestions for your next best action on every deal.",
                icon: Bot
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                description: "For individuals and small teams",
                features: ["100 leads/month", "Email generator", "Proposal generator"],
                cta: "Start free"
              },
              {
                name: "Growth",
                price: "$19",
                period: "/month",
                description: "For growing teams",
                features: ["Unlimited leads", "AI risk prediction", "Pipeline analytics", "Priority support"],
                cta: "Start trial",
                popular: true
              },
              {
                name: "Custom",
                price: "Custom",
                description: "For large organizations",
                features: ["Everything in Growth", "Team management", "Custom integrations", "Dedicated support"],
                cta: "Contact sales"
              }
            ].map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-indigo-600 shadow-lg scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white">Most popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-3 shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => navigate('/signup')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold text-gray-900">Frequently asked questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Do I need a CRM to use PipelineIQ?",
                a: "No. You can import leads manually or connect your existing CRM like Salesforce or HubSpot."
              },
              {
                q: "Can PipelineIQ generate emails automatically?",
                a: "Yes. Our AI generates personalized emails based on lead data and your winning templates."
              },
              {
                q: "Is my sales data secure?",
                a: "Absolutely. We use enterprise-grade encryption and never share your data with third parties."
              },
              {
                q: "Can I export proposals?",
                a: "Yes. You can export proposals as PDF or share them directly with clients."
              }
            ].map((faq, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
              </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-indigo-600">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Start closing deals with AI insights</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Try PipelineIQ free for 14 days. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')} className="bg-white text-indigo-600 hover:bg-indigo-50 px-8">
            Start your free trial
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-indigo-600">PipelineIQ</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                AI-powered deal intelligence for modern sales teams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-sm text-gray-600 hover:text-indigo-600">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-sm text-gray-600 hover:text-indigo-600">Pricing</button></li>
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">Integrations</button></li>
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">API</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">About</button></li>
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">Blog</button></li>
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">Careers</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">Documentation</button></li>
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">Support</button></li>
                <li><button className="text-sm text-gray-600 hover:text-indigo-600">Legal</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 PipelineIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;