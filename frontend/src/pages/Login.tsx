import { useState } from 'react';
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
} from 'lucide-react';

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
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

  const from = location.state?.from?.pathname || '/dashboard';

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
      // The social login will redirect, so we don't need to navigate here
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to login with ${provider}`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - Brand side (Attio style) */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-12 flex-col justify-between border-r border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">PipelineIQ</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-md"
        >
          <h1 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">
            AI-powered sales intelligence
          </h1>
          <p className="text-gray-500 leading-relaxed">
            PipelineIQ helps sales teams close more deals with real-time insights, 
            risk prediction, and automated workflows.
          </p>
          
          <div className="mt-8 space-y-4">
            {[
              "Real-time deal scoring",
              "AI-powered risk detection",
              "Automated follow-ups"
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm text-gray-600">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center space-x-4 text-xs text-gray-400">
            <span>Trusted by 2,000+ teams</span>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400"
        >
          © 2026 PipelineIQ. All rights reserved.
        </motion.div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">PipelineIQ</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-3 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.email ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                    errors.password ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500/20"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-gray-600">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 text-sm font-medium transition-all"
              disabled={isLoading || socialLoading !== null}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                <span className="flex items-center justify-center">
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center space-x-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="flex items-center justify-center space-x-2 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-4 h-4" />
                  <span>Google</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up
            </Link>
          </p>

          {/* Terms notice */}
          <p className="mt-4 text-center text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-gray-600 hover:text-blue-600">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;