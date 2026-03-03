import { useState } from 'react';
import Layout from './Layout';
import Dashboard from './components/Dashboard';
import StudyPlanner from './components/StudyPlanner';
import StudyMode from './components/StudyMode';
import Settings from './components/Settings';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';

type Section = 'dashboard' | 'planner' | 'study-mode' | 'settings';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={() => setActiveSection('planner')} onStudyModeClick={() => setActiveSection('study-mode')} />;
      case 'planner':
        return <StudyPlanner />;
      case 'study-mode':
        return <StudyMode />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        <ProgressProvider>
          <Layout activeSection={activeSection} onSectionChange={setActiveSection}>
            {renderSection()}
          </Layout>
        </ProgressProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
