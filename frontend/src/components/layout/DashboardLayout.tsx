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
  Plus,
  ChevronRight,
  ChevronLeft,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Home,
  Github,
  Twitter,
  Linkedin,
  HelpCircle,
  LogIn,
  UserPlus,
  BarChart,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../contexts/workspace/useWorkspace'; // ← ADD THIS
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Input } from "../ui/input";
import { getInitials } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

interface NavItem {
  to: string;
  icon: any;
  label: string;
  badge?: number;
  roles?: string[];
}

// Navigation items with sections
const navSections = [
  {
    title: 'GENERAL',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/leads', icon: Users, label: 'Leads' },
      { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
    ]
  },
  {
    title: 'AI TOOLS',
    items: [
      { to: '/ai/copilot', icon: Bot, label: 'AI Copilot', badge: 3 },
      { to: '/ai/emails', icon: Mail, label: 'Email Generator' },
      { to: '/ai/meetings', icon: FileText, label: 'Meeting Notes' },
      { to: '/ai/deal-risk', icon: AlertCircle, label: 'Deal Risk' },
      { to: '/ai/proposals', icon: Target, label: 'Proposals' },
    ]
  }
];

const SidebarItem = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `relative flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`relative ${collapsed ? '' : 'mr-3'}`}>
            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
        </>
      )}
    </NavLink>
  );
};

// Workspace Switcher Component (Now with Real Data)
const WorkspaceSwitcher = ({ collapsed }: { collapsed: boolean }) => {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useWorkspace();

  const handleCreateWorkspace = async () => {
    if (newWorkspaceName.trim()) {
      await createWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
      setShowCreateDialog(false);
    }
  };

  const handleSwitchWorkspace = async (workspaceId: string) => {
    await switchWorkspace(workspaceId);
    setOpen(false);
  };

  if (collapsed) {
    return (
      <div className="px-2 py-2 border-b border-border">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-full h-9">
              <Briefcase className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => handleSwitchWorkspace(ws.id)}
                className="flex items-center justify-between"
              >
                {ws.name}
                {currentWorkspace?.id === ws.id && <CheckCircle2 className="w-3 h-3 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create Workspace Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Enter a name for your new workspace
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="e.g. Marketing Team"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 border-b border-border">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-primary" />
            </div>
            <span className="font-medium text-sm">
              {currentWorkspace?.name || 'Select Workspace'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => handleSwitchWorkspace(ws.id)}
              className="flex items-center justify-between"
            >
              {ws.name}
              {currentWorkspace?.id === ws.id && <CheckCircle2 className="w-3 h-3 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Enter a name for your new workspace
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g. Marketing Team"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Profile Settings Dialog
const ProfileSettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
  });

  const handleSave = async () => {
    try {
      await updateUser(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your personal information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <Input
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Command Palette Component
const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search or jump to..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/leads'))}>
              <Users className="w-4 h-4 mr-2" />
              Leads
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/pipeline'))}>
              <Kanban className="w-4 h-4 mr-2" />
              Pipeline
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="AI Tools">
            <CommandItem onSelect={() => runCommand(() => navigate('/ai/copilot'))}>
              <Bot className="w-4 h-4 mr-2" />
              AI Copilot
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/ai/emails'))}>
              <Mail className="w-4 h-4 mr-2" />
              Email Generator
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/ai/meetings'))}>
              <FileText className="w-4 h-4 mr-2" />
              Meeting Notes
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => navigate('/leads?new=true'))}>
              <Plus className="w-4 h-4 mr-2" />
              Create Lead
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/ai/emails?new=true'))}>
              <Mail className="w-4 h-4 mr-2" />
              Generate Email
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

// Notification Drawer Component
const NotificationDrawer = () => {
  const [open, setOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'New lead assigned', description: 'Vishal Attri from Tech Innovations', time: '5m ago', icon: Users, color: 'blue' },
    { id: 2, title: 'AI analysis completed', description: 'Risk analysis for 3 deals ready', time: '1h ago', icon: Bot, color: 'purple' },
    { id: 3, title: 'Proposal viewed', description: 'Enterprise proposal was viewed', time: '2h ago', icon: FileText, color: 'green' },
    { id: 4, title: 'Deal at risk', description: 'High-value deal needs attention', time: '3h ago', icon: AlertCircle, color: 'red' },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            You have {notifications.length} unread notifications
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              green: 'bg-green-100 text-green-600',
              red: 'bg-red-100 text-red-600',
            }[notification.color] || 'bg-gray-100 text-gray-600';

            return (
              <div key={notification.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClasses}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full">
            View all notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Quick Actions Menu
const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate('/leads?new=true')}>
          <Users className="w-4 h-4 mr-2" />
          Create Lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/ai/emails?new=true')}>
          <Mail className="w-4 h-4 mr-2" />
          Generate Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/ai/proposals?new=true')}>
          <FileText className="w-4 h-4 mr-2" />
          Create Proposal
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/pipeline')}>
          <Kanban className="w-4 h-4 mr-2" />
          View Pipeline
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Loading Bar
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { workspaces, isLoading: workspacesLoading } = useWorkspace(); // Add this

  useEffect(() => {
    // NProgress for page transitions
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
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

  // Show loading state while workspaces are loading
  if (workspacesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette />

      {/* Profile Settings Dialog */}
      <ProfileSettingsDialog open={showProfileDialog} onOpenChange={setShowProfileDialog} />

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your application preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === 'light' ? 'Enable Dark' : 'Enable Light'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Notifications</span>
              <Badge variant="outline">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Two-Factor Auth</span>
              <Badge variant="outline">Off</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule</DialogTitle>
            <DialogDescription>
              View and manage your upcoming meetings
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Meeting with Sarah Chen</p>
              <p className="text-xs text-muted-foreground">Today • 2:00 PM</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Product Demo</p>
              <p className="text-xs text-muted-foreground">Tomorrow • 11:00 AM</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Team Review</p>
              <p className="text-xs text-muted-foreground">Mar 15 • 10:00 AM</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
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
        <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-4'} border-b border-border`}>
          {sidebarCollapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">
                PipelineIQ
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/20 ml-2 text-xs">Beta</Badge>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher collapsed={sidebarCollapsed} />

        {/* Navigation */}
        <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-13rem)]">
          {navSections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <p className="text-xs font-semibold text-muted-foreground px-3 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem key={item.to} item={item} collapsed={sidebarCollapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Version */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
            v1.0 Beta
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <header className="h-16 bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between h-full px-3 lg:px-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex h-8 w-8"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </Button>

              {/* Breadcrumbs - Hidden on mobile */}
              <div className="hidden lg:flex items-center text-sm text-muted-foreground">
                <Home className="w-4 h-4" />
                <ChevronRight className="w-3 h-3 mx-1" />
                <span className="text-foreground font-medium capitalize">
                  {location.pathname.split('/').pop() || 'Dashboard'}
                </span>
              </div>

              {/* Search - Hidden on mobile */}
              <div className="hidden md:flex items-center relative ml-2">
                <Search className="absolute left-2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-48 lg:w-64 h-9 pl-8 pr-8 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                    document.dispatchEvent(event);
                  }}
                  readOnly
                />
                <kbd className="absolute right-2 px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded border border-border">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Quick Actions - Hidden on very small screens */}
              <div className="hidden sm:block">
                <QuickActions />
              </div>

              {/* Activity Indicator */}
              <Badge variant="outline" className="hidden md:flex items-center space-x-1 px-2 py-1">
                <Activity className="w-3 h-3" />
                <span className="text-xs">3</span>
              </Badge>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              {/* Notifications Drawer */}
              <NotificationDrawer />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 h-9 px-2">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {getInitials(user?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium max-w-[100px] truncate">{user?.name}</p>
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5" />
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <ChevronDown className="hidden lg:block w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                    <UserIcon className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
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
        <main className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
