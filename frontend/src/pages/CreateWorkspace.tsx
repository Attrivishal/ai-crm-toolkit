import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../contexts/workspace/useWorkspace';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Briefcase, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export const CreateWorkspace = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createWorkspace, workspaces } = useWorkspace();
  const navigate = useNavigate();

  // If user already has workspaces, give option to go back
  useEffect(() => {
    if (workspaces.length > 0) {
      // Don't auto-redirect, just let them know they can go back
    }
  }, [workspaces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      await createWorkspace(name);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error creating workspace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Your Workspace</CardTitle>
          <CardDescription>
            Get started by creating your first workspace. This is where all your leads and deals will live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Workspace Name
              </label>
              <Input
                placeholder="e.g., Acme Corporation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="h-12"
              />
              <p className="text-xs text-gray-500">
                You can always rename this later or create additional workspaces.
              </p>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            
            {workspaces.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
