import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { taskController, type TabId } from '@/services/taskController';
import { useAuth } from '@/contexts/AuthContext';

interface TaskControllerContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTransitioning: boolean;
}

const TaskControllerContext = createContext<TaskControllerContextType | undefined>(undefined);

export const TaskControllerProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTabState] = useState<TabId>('map');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user } = useAuth();

  // Update userId in task controller when user changes
  useEffect(() => {
    taskController.setUserId(user?.id || null);
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      taskController.cleanup();
    };
  }, []);

  // Initialize with map tab
  useEffect(() => {
    taskController.switchTab('map');
  }, []);

  const setActiveTab = useCallback(async (tab: TabId) => {
    if (tab === activeTab) return;
    
    setIsTransitioning(true);
    setActiveTabState(tab);
    
    await taskController.switchTab(tab);
    
    setIsTransitioning(false);
  }, [activeTab]);

  return (
    <TaskControllerContext.Provider value={{ activeTab, setActiveTab, isTransitioning }}>
      {children}
    </TaskControllerContext.Provider>
  );
};

export const useTaskController = () => {
  const context = useContext(TaskControllerContext);
  if (!context) {
    throw new Error('useTaskController must be used within a TaskControllerProvider');
  }
  return context;
};

export default TaskControllerProvider;
