import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Mail, 
  FileText, 
  Globe, 
  Database,
  Eye,
  Bell,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  Key,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

const Privacy = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Information We Collect", icon: Database, color: "blue" },
    { label: "How We Use Data", icon: Settings, color: "green" },
    { label: "Data Security", icon: Lock, color: "purple" },
    { label: "Your Rights", icon: Users, color: "orange" }
  ];

  const dataPoints = [
    {
      title: "Account Information",
      items: ["Name and email", "Company and role", "Login credentials"],
      icon: Users,
      color: "blue"
    },
    {
      title: "Usage Data",
      items: ["Feature interactions", "Session duration", "Page views"],
      icon: Eye,
      color: "green"
    },
    {
      title: "Lead Data",
      items: ["Customer information", "Deal values", "Communication history"],
      icon: Database,
      color: "purple"
    },
    {
      title: "Technical Data",
      items: ["IP address", "Browser type", "Device information"],
      icon: Server,
      color: "orange"
    }
  ];

  const thirdParties = [
    { name: "Stripe", purpose: "Payment processing", icon: Lock, color: "blue" },
    { name: "OpenAI", purpose: "AI features (anonymized)", icon: Key, color: "green" },
    { name: "MongoDB Atlas", purpose: "Database hosting", icon: Database, color: "purple" },
    { name: "Vercel", purpose: "Application hosting", icon: Globe, color: "orange" }
  ];

  const yourRights = [
    { right: "Access your data", desc: "View all personal information we store", icon: Eye },
    { right: "Correct data", desc: "Update inaccurate information", icon: Settings },
    { right: "Request deletion", desc: "Permanently remove your data", icon: AlertCircle },
    { right: "Export data", desc: "Download your data in JSON format", icon: Download },
    { right: "Opt out", desc: "Unsubscribe from marketing", icon: Bell }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')} 
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-sm font-medium text-gray-900">Privacy Policy</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                GDPR Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                SOC2 Type II
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-6xl px-4 py-12"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs">
            Last updated: March 2026
          </Badge>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Your data belongs to <span className="text-blue-600">you</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            We believe in transparency and giving you full control over your information. 
            Here's how we handle your data.
          </p>
        </motion.div>

        {/* Quick links */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-12">
          {quickLinks.map((link, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-200 hover:border-gray-300"
            >
              <link.icon className={`w-4 h-4 mr-2 text-${link.color}-600`} />
              {link.label}
            </Button>
          ))}
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Main policy content */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            {/* Introduction */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  PipelineIQ ("we," "our," or "us") is committed to protecting your privacy. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you use our sales intelligence platform.
                </p>
              </CardContent>
            </Card>

            {/* Information we collect - Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {dataPoints.map((point, i) => {
                const Icon = point.icon;
                return (
                  <Card key={i} className="border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className={`w-8 h-8 bg-${point.color}-50 rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className={`w-4 h-4 text-${point.color}-600`} />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">{point.title}</h3>
                      <ul className="space-y-1">
                        {point.items.map((item, j) => (
                          <li key={j} className="text-xs text-gray-500 flex items-center">
                            <CheckCircle2 className={`w-3 h-3 text-${point.color}-400 mr-1`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* How we use information */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Provide and maintain services",
                    "Improve your experience",
                    "Communicate updates",
                    "Analyze usage patterns",
                    "Prevent fraud",
                    "Optimize AI models"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right column - Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Data Security */}
            <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    Enterprise
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">4. Data Security</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  256-bit encryption, SOC2 compliance, and regular security audits. 
                  Your data is stored in secure AWS data centers.
                </p>
              </CardContent>
            </Card>

            {/* Third-party services */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">5. Third-Party Services</h3>
                <div className="space-y-3">
                  {thirdParties.map((service, i) => {
                    const Icon = service.icon;
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 bg-${service.color}-50 rounded flex items-center justify-center`}>
                            <Icon className={`w-3 h-3 text-${service.color}-600`} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-900">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.purpose}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs bg-gray-50">
                          Active
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">6. Your Rights</h3>
                <div className="space-y-2">
                  {yourRights.map((right, i) => {
                    const Icon = right.icon;
                    return (
                      <div key={i} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">{right.right}</p>
                          <p className="text-xs text-gray-500">{right.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-gray-100 shadow-sm bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">7. Contact Us</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href="mailto:privacy@pipelineiq.com" className="text-xs text-blue-600 hover:underline">
                      privacy@pipelineiq.com
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">123 Sales Street, San Francisco, CA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div variants={itemVariants} className="mt-12 text-center pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-4">Trusted by innovative sales teams</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {['Salesforce', 'HubSpot', 'Slack', 'ZoomInfo', 'Outreach'].map((company) => (
              <span key={company} className="text-sm font-medium text-gray-400">
                {company}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Privacy;