import { Routes, Route, Navigate } from 'react-router-dom';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

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

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

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

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
