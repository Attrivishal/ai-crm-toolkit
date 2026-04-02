import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  Bot,
  Sparkles,
  Eye,
  EyeOff,
  Github,
  Chrome,
  Loader2,
  Briefcase,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    setError(null);

    try {
      await socialLogin(provider);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to login with ${provider}`);
      setSocialLoading(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        damping: 10,
      },
    },
  };

  const floatingIcons = [
    { Icon: TrendingUp, color: "text-blue-500", delay: 0, x: 10, y: 20 },
    { Icon: Shield, color: "text-green-500", delay: 0.5, x: 80, y: 60 },
    { Icon: Zap, color: "text-yellow-500", delay: 1, x: 70, y: 85 },
    { Icon: CheckCircle2, color: "text-purple-500", delay: 1.5, x: 20, y: 70 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-50" />
      
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          x: mousePosition.x * 0.1,
          y: mousePosition.y * 0.1,
        }}
        transition={{ type: "spring", damping: 50 }}
        className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          x: mousePosition.x * -0.1,
          y: mousePosition.y * -0.1,
        }}
        transition={{ type: "spring", damping: 50 }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
      />

      {/* Floating icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.Icon;
        return (
          <motion.div
            key={i}
            className={`absolute ${item.color}`}
            initial={{ x: `${item.x}%`, y: `${item.y}%`, opacity: 0 }}
            animate={{
              x: [`${item.x}%`, `${item.x + 5}%`, `${item.x}%`],
              y: [`${item.y}%`, `${item.y - 5}%`, `${item.y}%`],
              opacity: 0.2,
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: item.delay,
            }}
          >
            <Icon className="w-12 h-12" />
          </motion.div>
        );
      })}

      {/* Left panel - Brand side with floating cards */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
          {/* Animated shapes */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 40% 60% / 60% 60% 40% 40%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              borderRadius: ["60% 40% 40% 60% / 60% 60% 40% 40%", "30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 40% 60% / 60% 60% 40% 40%"],
            }}
            transition={{ duration: 18, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">PipelineIQ</span>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-lg"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-5xl font-bold mb-6 leading-tight"
            >
              Transform your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 block">
                sales pipeline
              </span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg text-white/80 mb-10 leading-relaxed"
            >
              AI-powered insights that help you close deals faster, predict risks, and automate follow-ups.
            </motion.p>

            <motion.div variants={itemVariants} className="space-y-4">
              {[
                "Real-time deal scoring with ML",
                "Predictive risk detection",
                "Automated workflow optimization"
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 10 }}
                  className="flex items-center space-x-3 group"
                >
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-10 flex items-center space-x-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/30 backdrop-blur-sm flex items-center justify-center"
                  >
                    <span className="text-xs font-bold text-white">U{i}</span>
                  </motion.div>
                ))}
              </div>
              <div className="text-sm text-white/70">
                <span className="font-bold text-white">2,000+</span> teams already onboard
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-white/50"
          >
            © 2026 PipelineIQ. Enterprise-grade security.
          </motion.div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="w-full max-w-md relative"
        >
          {/* Floating card effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse-slow" />
          
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PipelineIQ</span>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500">
                Sign in to access your AI-powered dashboard
              </p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-1"
              >
                <label className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@company.com"
                    className={`w-full pl-12 pr-4 py-3 text-base bg-gray-50 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-transparent focus:border-blue-500 focus:bg-white hover:bg-white'
                    }`}
                  />
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 mt-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-3 text-base bg-gray-50 border-2 rounded-xl focus:outline-none transition-all ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-transparent focus:border-blue-500 focus:bg-white hover:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-red-600 mt-1"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center"
              >
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Keep me signed in
                </label>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all"
                  disabled={isLoading || socialLoading !== null}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign in to dashboard
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="relative my-8"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm text-gray-400">Or continue with</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center space-x-3 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {socialLoading === 'github' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Github className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">GitHub</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={socialLoading !== null}
                className="flex items-center justify-center space-x-3 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {socialLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Chrome className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Google</span>
                  </>
                )}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Start free trial
                </Link>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-center"
            >
              <p className="text-xs text-gray-400">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="text-gray-500 hover:text-blue-600 transition-colors">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">Privacy</Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;