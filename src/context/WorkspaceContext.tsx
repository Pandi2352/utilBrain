import React, { createContext, useContext, useState, useEffect } from 'react';

interface WorkspaceContextType {
  pinnedTools: string[]; // Tool paths like '/tools/emi'
  togglePin: (path: string) => void;
  isPinned: (path: string) => boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinnedTools, setPinnedTools] = useState<string[]>(() => {
    const stored = localStorage.getItem('ub-pinned-tools');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('ub-pinned-tools', JSON.stringify(pinnedTools));
  }, [pinnedTools]);

  const togglePin = (path: string) => {
    setPinnedTools(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    );
  };

  const isPinned = (path: string) => pinnedTools.includes(path);

  return (
    <WorkspaceContext.Provider value={{ pinnedTools, togglePin, isPinned }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};
