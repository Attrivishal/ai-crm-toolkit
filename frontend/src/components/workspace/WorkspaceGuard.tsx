import { useWorkspace } from '../../contexts/workspace/useWorkspace';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Briefcase, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkspaceGuard = ({ children }: { children: JSX.Element }) => {
  const { currentWorkspace, isLoading, workspaces } = useWorkspace();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // If user has workspaces but none selected, select the first one
  if (workspaces.length > 0 && !currentWorkspace) {
    return children;
  }

  // If no workspaces, show create prompt but don't redirect
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to PipelineIQ!</h2>
          <p className="text-gray-600 mb-6">
            You don't have any workspaces yet. Create your first workspace to get started.
          </p>
          <Button 
            onClick={() => navigate('/workspaces/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
        </Card>
      </div>
    );
  }

  return children;
};
