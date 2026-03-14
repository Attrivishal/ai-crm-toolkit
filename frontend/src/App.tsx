import { Routes, Route, Navigate } from 'react-router-dom';
import Favicon from 'react-favicon';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Main Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import Copilot from './pages/Copilot';
import EmailGenerator from './pages/EmailGenerator';
import MeetingNotes from './pages/MeetingNotes';
import DealRisk from './pages/DealRisk';
import ProposalGenerator from './pages/ProposalGenerator';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Legal Pages
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Security from './pages/Security';

function App() {
  return (
    <>
      {/* PipelineIQ Favicon - Connected Nodes Logo */}
      <Favicon url="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%234f46e5'/%3E%3Ccircle cx='30' cy='50' r='15' fill='white' /%3E%3Ccircle cx='70' cy='50' r='15' fill='white' /%3E%3Ccircle cx='50' cy='50' r='15' fill='white' /%3E%3Cline x1='45' y1='50' x2='55' y2='50' stroke='%234f46e5' stroke-width='6' stroke-linecap='round' /%3E%3C/svg%3E" />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Legal Pages - Public */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/security" element={<Security />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/ai/copilot" element={<Copilot />} />
            <Route path="/ai/emails" element={<EmailGenerator />} />
            <Route path="/ai/meetings" element={<MeetingNotes />} />
            <Route path="/ai/deal-risk" element={<DealRisk />} />
            <Route path="/ai/proposals" element={<ProposalGenerator />} />
          </Route>
        </Route>

        {/* 404 Redirect - Send to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;