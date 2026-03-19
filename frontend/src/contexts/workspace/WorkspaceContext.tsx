import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { workspaceApi } from '../../lib/api';
import type { Workspace } from '../../lib/api';
import toast from 'react-hot-toast';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<void>;
  updateWorkspace: (workspaceId: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspaces when user is authenticated
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      const response = await workspaceApi.getWorkspaces();
      const workspacesData = response.data.workspaces || [];
      setWorkspaces(workspacesData);
      
      // Set default workspace (first one or previously selected)
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const defaultWorkspace = workspacesData.find((w: Workspace) => w.id === savedWorkspaceId) || workspacesData[0];
      
      if (defaultWorkspace) {
        setCurrentWorkspace(defaultWorkspace);
        localStorage.setItem('currentWorkspaceId', defaultWorkspace.id);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspaceId);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('workspaceChange'));
      toast.success(`Switched to ${workspace.name}`);
    }
  };

  const createWorkspace = async (name: string) => {
    try {
      const response = await workspaceApi.createWorkspace({ name });
      const newWorkspace = response.data.workspace;
      setWorkspaces([...workspaces, newWorkspace]);
      await switchWorkspace(newWorkspace.id);
      toast.success('Workspace created successfully');
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error('Failed to create workspace');
      throw error;
    }
  };

  const updateWorkspace = async (workspaceId: string, data: Partial<Workspace>) => {
    try {
      const response = await workspaceApi.updateWorkspace(workspaceId, data);
      const updatedWorkspace = response.data.workspace;
      
      setWorkspaces(workspaces.map(w => 
        w.id === workspaceId ? updatedWorkspace : w
      ));
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(updatedWorkspace);
      }
      
      toast.success('Workspace updated successfully');
    } catch (error) {
      console.error('Failed to update workspace:', error);
      toast.error('Failed to update workspace');
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await workspaceApi.deleteWorkspace(workspaceId);
      
      const remainingWorkspaces = workspaces.filter(w => w.id !== workspaceId);
      setWorkspaces(remainingWorkspaces);
      
      if (currentWorkspace?.id === workspaceId) {
        // Switch to another workspace
        if (remainingWorkspaces.length > 0) {
          await switchWorkspace(remainingWorkspaces[0].id);
        } else {
          setCurrentWorkspace(null);
          localStorage.removeItem('currentWorkspaceId');
        }
      }
      
      toast.success('Workspace deleted successfully');
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      toast.error('Failed to delete workspace');
      throw error;
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      isLoading,
      switchWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      refreshWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
