import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Home } from './components/Home';
import { NewsCenter } from './components/NewsCenter';
import { ExpertDirectory } from './components/ExpertDirectory';
import { ProjectShowcase } from './components/ProjectShowcase';
import { ActivityCenter } from './components/ActivityCenter';
import { ProductCatalog } from './components/ProductCatalog';
import { UserProfile } from './components/UserProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';

export type PageType = 'home' | 'news' | 'experts' | 'projects' | 'activities' | 'products' | 'profile' | 'admin';

export interface NavigationParams {
  activityId?: number;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [navParams, setNavParams] = useState<NavigationParams>({});
  const [isAdmin, setIsAdmin] = useState(false);

  const handleNavigate = (page: PageType, params?: NavigationParams) => {
    setCurrentPage(page);
    setNavParams(params || {});
  };

  const renderPage = () => {
    if (isAdmin) {
      return <AdminDashboard onBack={() => setIsAdmin(false)} />;
    }

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'news':
        return <NewsCenter />;
      case 'experts':
        return <ExpertDirectory />;
      case 'projects':
        return <ProjectShowcase />;
      case 'activities':
        return <ActivityCenter initialActivityId={navParams.activityId} />;
      case 'products':
        return <ProductCatalog />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAdmin && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onAdminClick={() => setIsAdmin(true)}
        />
      )}
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteConfigProvider>
        <AppContent />
      </SiteConfigProvider>
    </AuthProvider>
  );
}