import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  CheckCircle2, 
  Server, 
  Key, 
  Eye, 
  Clock,
  FileText,
  Globe,
  Zap,
  Award,
  Download,
  Mail,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const Security = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "SOC2 Type II",
      desc: "Annual audits ensure highest security standards",
      badge: "Certified 2026",
      color: "blue"
    },
    {
      icon: Lock,
      title: "256-bit Encryption",
      desc: "AES-256 & TLS 1.3 for data at rest and in transit",
      badge: "Enterprise Grade",
      color: "indigo"
    },
    {
      icon: Key,
      title: "Role-Based Access",
      desc: "Granular permissions for complete control",
      badge: "RBAC",
      color: "purple"
    },
    {
      icon: Eye,
      title: "24/7 Monitoring",
      desc: "Continuous threat detection and response",
      badge: "Real-time",
      color: "green"
    },
    {
      icon: Clock,
      title: "Automatic Backups",
      desc: "Daily encrypted backups with 30-day retention",
      badge: "DR Ready",
      color: "orange"
    },
    {
      icon: CheckCircle2,
      title: "GDPR Compliant",
      desc: "Full compliance with EU data regulations",
      badge: "Certified",
      color: "pink"
    }
  ];

  const certifications = [
    { name: "SOC2 Type II", icon: Shield, status: "Audited 2026", color: "blue" },
    { name: "ISO 27001", icon: Award, status: "Certified", color: "green" },
    { name: "GDPR", icon: Globe, status: "Compliant", color: "purple" },
    { name: "HIPAA", icon: Lock, status: "Eligible", color: "indigo" },
    { name: "PCI DSS", icon: FileText, status: "Level 1", color: "orange" },
    { name: "EU-US Privacy", icon: Shield, status: "Framework", color: "pink" }
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
              <span className="text-sm font-medium text-gray-900">Security</span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="w-3 h-3 mr-1" />
              Enterprise Ready
            </Badge>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-6xl px-4 py-16"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 px-3 py-1 text-xs">
            Trust & Safety
          </Badge>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            Enterprise-grade security, <span className="text-blue-600">built-in</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Your data is protected with the highest industry standards. We're committed to keeping your information safe and secure.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 bg-${feature.color}-50 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${feature.color}-600`} />
                  </div>
                  <Badge variant="outline" className={`text-${feature.color}-600 bg-${feature.color}-50 border-${feature.color}-200 text-xs`}>
                    {feature.badge}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Certifications */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Certifications & Compliance</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 text-sm">
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {certifications.map((cert, i) => {
              const Icon = cert.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100"
                >
                  <div className={`w-8 h-8 mx-auto bg-${cert.color}-100 rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 text-${cert.color}-600`} />
                  </div>
                  <p className="text-xs font-medium text-gray-900">{cert.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{cert.status}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Data Processing */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Processing Agreement</h3>
            <p className="text-sm text-gray-600 mb-4">
              We sign DPAs with all enterprise customers. Our data processing follows strict guidelines.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                Data stored in US/EU regions
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                No third-party access without consent
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                30-day automatic deletion
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                Regular penetration testing
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Contact Security Team</h3>
            <p className="text-sm text-blue-100 mb-6">
              For security issues or to request a security review
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-blue-200" />
                <a href="mailto:security@pipelineiq.com" className="hover:underline">
                  security@pipelineiq.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  asChild
                >
                  <a href="#" className="flex items-center">
                    <Download className="w-3 h-3 mr-2" />
                    Download PGP Key
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={itemVariants} className="text-center pt-8 border-t border-gray-100">
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

export default Security;