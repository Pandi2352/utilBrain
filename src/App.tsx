import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { AppRoutes } from './routes';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { SecurityIndicator } from './components/layout/SecurityIndicator';

function App() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('ub-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ub-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <SecurityIndicator />
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-base)' }}>
          <Sidebar />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Navbar dark={dark} onToggleDark={() => setDark(d => !d)} />
            <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <AppRoutes />
            </main>
          </div>
        </div>
      </WorkspaceProvider>
    </BrowserRouter>
  );
}

export default App;
