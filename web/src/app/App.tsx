import { useState, useEffect } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Home } from './components/Home';
import { NewsCenter } from './components/NewsCenter';
import { ExpertDirectory } from './components/ExpertDirectory';
import { ProjectShowcase } from './components/ProjectShowcase';
import { ActivityCenter } from './components/ActivityCenter';
import { ProductCatalog } from './components/ProductCatalog';
import { UserProfile } from './components/UserProfile';
import { MyRegistrations } from './components/MyRegistrations';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { SiteConfigProvider } from '@/contexts/SiteConfigContext';

export type PageType = 'home' | 'news' | 'experts' | 'projects' | 'activities' | 'products' | 'profile' | 'my-registrations' | 'admin';

export interface NavigationParams {
  activityId?: number;
  newsId?: number;
  expertId?: number;
  projectId?: number;
  productId?: number;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [navParams, setNavParams] = useState<NavigationParams>({});
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle URL parameters for deep linking (e.g., /activities?activityId=3)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname.replace('/', '');

    if (path && path !== 'home') {
      const pageMap: Record<string, PageType> = {
        activities: 'activities',
        news: 'news',
        experts: 'experts',
        projects: 'projects',
        products: 'products',
      };
      const page = pageMap[path];
      if (page) {
        setCurrentPage(page);
        // Parse all possible ID parameters
        const navParams: NavigationParams = {};
        const activityId = params.get('activityId');
        const newsId = params.get('newsId');
        const expertId = params.get('expertId');
        const projectId = params.get('projectId');
        const productId = params.get('productId');

        if (activityId) navParams.activityId = parseInt(activityId, 10);
        if (newsId) navParams.newsId = parseInt(newsId, 10);
        if (expertId) navParams.expertId = parseInt(expertId, 10);
        if (projectId) navParams.projectId = parseInt(projectId, 10);
        if (productId) navParams.productId = parseInt(productId, 10);

        setNavParams(navParams);
      }
    }
  }, []);

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
        return <NewsCenter initialNewsId={navParams.newsId} />;
      case 'experts':
        return <ExpertDirectory initialExpertId={navParams.expertId} />;
      case 'projects':
        return <ProjectShowcase initialProjectId={navParams.projectId} />;
      case 'activities':
        return <ActivityCenter initialActivityId={navParams.activityId} />;
      case 'products':
        return <ProductCatalog initialProductId={navParams.productId} />;
      case 'profile':
        return <UserProfile />;
      case 'my-registrations':
        return <MyRegistrations onNavigate={handleNavigate} />;
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