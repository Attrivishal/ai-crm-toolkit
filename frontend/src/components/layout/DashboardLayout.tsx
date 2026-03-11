import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  MessageSquare,
  Briefcase,
  FileText,
  Bot,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Target,
  Mail,
  AlertCircle,
  Calendar,
  User as UserIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { getInitials } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  badge?: number;
  roles?: string[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/ai/copilot', icon: Bot, label: 'AI Copilot', badge: 3 },
  { to: '/ai/emails', icon: Mail, label: 'Email Generator' },
  { to: '/ai/meetings', icon: FileText, label: 'Meeting Notes' },
  { to: '/ai/deal-risk', icon: AlertCircle, label: 'Deal Risk' },
  { to: '/ai/proposals', icon: Target, label: 'Proposals' },
];

const SidebarItem = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `relative flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-primary-500/10 to-primary-500/5 text-primary-600'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`relative ${collapsed ? '' : 'mr-3'}`}>
            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className="flex-1">{item.label}</span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
              {item.label}
            </div>
          )}
          {isActive && !collapsed && (
            <motion.div
              layoutId="activeNav"
              className="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
};

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-border`}>
          {sidebarCollapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                SalesMind
              </span>
              <Badge variant="gradient" size="sm" className="ml-2">AI</Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => (
            <SidebarItem key={item.to} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className="h-16 bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </Button>

              {/* Search */}
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search deals, leads, or tasks..."
                  className="w-80 h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
                <kbd className="absolute right-3 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded border border-border">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 h-10 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-400 text-white">
                        {getInitials(user?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;