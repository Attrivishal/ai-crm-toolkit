import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Mail, 
  FileText, 
  Globe, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Key,
  Scale,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Users,
  Ban,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    { id: "agreement", title: "Agreement", icon: FileText, color: "blue" },
    { id: "service", title: "Service", icon: Zap, color: "green" },
    { id: "accounts", title: "Accounts", icon: User, color: "purple" },
    { id: "payments", title: "Payments", icon: CreditCard, color: "orange" },
    { id: "acceptable-use", title: "Acceptable Use", icon: Ban, color: "red" },
    { id: "ip", title: "Intellectual Property", icon: Scale, color: "indigo" },
    { id: "termination", title: "Termination", icon: XCircle, color: "pink" },
    { id: "liability", title: "Liability", icon: Shield, color: "cyan" },
  ];

  const keyPoints = [
    { text: "Must be 18+ to use", icon: User, color: "blue" },
    { text: "Cancel anytime", icon: Calendar, color: "green" },
    { text: "30-day data retention", icon: Clock, color: "purple" },
    { text: "SOC2 compliant", icon: Shield, color: "orange" },
  ];

  const prohibitedActions = [
    "Illegal activities",
    "Malicious code",
    "Security bypass",
    "Content scraping",
    "Impersonation",
    "False information"
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
              <span className="text-sm font-medium text-gray-900">Terms of Service</span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Updated March 2026
            </Badge>
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
            Legal Agreement
          </Badge>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Terms of <span className="text-blue-600">Service</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            By using PipelineIQ, you agree to these terms. We've made them as clear as possible.
          </p>
        </motion.div>

        {/* Key points badges */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-12">
          {keyPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <Badge 
                key={i}
                variant="outline" 
                className={`px-3 py-1.5 bg-${point.color}-50 text-${point.color}-700 border-${point.color}-200`}
              >
                <Icon className={`w-3 h-3 mr-1`} />
                {point.text}
              </Badge>
            );
          })}
        </motion.div>

        {/* Quick navigation */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 mb-12">
          {sections.map((section, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-200 hover:border-gray-300"
            >
              <section.icon className={`w-4 h-4 mr-2 text-${section.color}-600`} />
              {section.title}
            </Button>
          ))}
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Main terms content */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Agreement */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">1. Agreement to Terms</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-11">
                  By accessing or using PipelineIQ, you agree to be bound by these Terms. 
                  If you disagree with any part, you may not access the service.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">2. Description of Service</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-11">
                  PipelineIQ provides AI-powered sales intelligence tools including lead scoring, 
                  deal risk prediction, email generation, and meeting summaries. We reserve the 
                  right to modify or discontinue any feature with reasonable notice.
                </p>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">3. User Accounts</h2>
                </div>
                <div className="pl-11 space-y-2">
                  {[
                    "You must be 18+ to use this service",
                    "You are responsible for maintaining account security",
                    "You are liable for all activities under your account",
                    "Notify us immediately of any unauthorized use"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <Ban className="w-4 h-4 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">5. Acceptable Use</h2>
                </div>
                <div className="pl-11">
                  <p className="text-sm text-gray-600 mb-3">You agree not to:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {prohibitedActions.map((action, i) => (
                      <div key={i} className="flex items-center text-sm text-gray-600">
                        <XCircle className="w-4 h-4 text-red-400 mr-2 shrink-0" />
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right column - Sidebar */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quick Summary */}
            <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                  Quick Summary
                </h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />
                    Monthly/annual billing in advance
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />
                    30-day data retention after cancellation
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />
                    No refunds for partial months
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />
                    Price changes with 30 days notice
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">4. Payments</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                </div>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />
                    Fees billed monthly or annually in advance
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-3 h-3 text-red-400 mr-2 shrink-0 mt-0.5" />
                    No refunds for partial months
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-3 h-3 text-orange-400 mr-2 shrink-0 mt-0.5" />
                    Free trials convert automatically
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* IP & Liability */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Scale className="w-4 h-4 mr-2 text-indigo-600" />
                      6. Intellectual Property
                    </h3>
                    <p className="text-xs text-gray-600">
                      We retain rights to our software and algorithms. You retain rights to your data.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-cyan-600" />
                      8. Limitation of Liability
                    </h3>
                    <p className="text-xs text-gray-600">
                      PipelineIQ shall not be liable for indirect, incidental, or consequential damages.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">7. Cancellation & Termination</h3>
                <p className="text-xs text-gray-600 mb-3">
                  You may cancel anytime from account settings. Data deleted within 30 days.
                </p>
                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                  <Clock className="w-3 h-3 mr-1" />
                  30-day retention
                </Badge>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-gray-100 shadow-sm bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">9. Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href="mailto:legal@pipelineiq.com" className="text-xs text-blue-600 hover:underline">
                      legal@pipelineiq.com
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

export default Terms;