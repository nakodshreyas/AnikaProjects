import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileQuickBar } from './components/layout/MobileQuickBar';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { YouTubeVideosSection } from './components/sections/YouTubeVideosSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { ReviewsSection } from './components/sections/ReviewsSection';
import { WhyUsSection } from './components/sections/WhyUsSection';
import { CallbackSection } from './components/sections/CallbackSection';
import { ContactSection } from './components/sections/ContactSection';
import { ProjectDetailModal } from './components/modals/ProjectDetailModal';
import { ServiceDetailModal } from './components/modals/ServiceDetailModal';
import { ReviewModal } from './components/modals/ReviewModal';
import { LoginPage } from './components/auth/LoginPage';
import { ClientDashboard } from './components/dashboard/ClientDashboard';
import { INITIAL_REVIEWS } from './data/reviewsData';
import { Project, ServiceItem, Review } from './types';
import { getStoredReviews, saveReviewToStorage } from './utils/storage';
import { logoutClient, ClientSession } from './utils/auth';

function getInitialRoute(): 'home' | 'login' | 'dashboard' {
  if (typeof window === 'undefined') return 'home';
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.toLowerCase().replace(/\/+$/, '');

  if (pathname === '/login' || hash === '#/login' || hash === '#login') {
    return 'login';
  }
  
  // Strictly catch /dashboard, /dashbord, or any subpath
  if (
    pathname === '/dashboard' ||
    pathname === '/dashbord' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/dashbord/') ||
    hash === '#/dashboard' ||
    hash === '#/dashbord' ||
    hash === '#dashboard' ||
    hash === '#dashbord'
  ) {
    return 'dashboard';
  }

  return 'home';
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'home' | 'login' | 'dashboard'>(getInitialRoute);
  // Strictly in-memory session only - never auto-restored on reload/visit so it asks credentials every single time
  const [clientSession, setClientSession] = useState<ClientSession | null>(null);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [preFilledCallback, setPreFilledCallback] = useState<string>('');

  // Handle URL location changes (back/forward, direct URL access)
  useEffect(() => {
    const handleLocationChange = () => {
      const nextRoute = getInitialRoute();
      setCurrentRoute(nextRoute);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (route: 'home' | 'login' | 'dashboard') => {
    const targetUrl = route === 'home' ? '/' : `/${route}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLoginSuccess = (session: ClientSession) => {
    setClientSession(session);
    navigate('dashboard');
  };

  const handleLogout = () => {
    logoutClient();
    setClientSession(null);
    navigate('login');
  };

  // Load reviews from database on mount and route sync
  useEffect(() => {
    const loadLiveReviews = () => {
      fetch('/api/reviews')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviews(data.reviews);
          } else {
            setReviews(getStoredReviews());
          }
        })
        .catch(() => {
          setReviews(getStoredReviews());
        });
    };

    loadLiveReviews();

    const handleReviewsUpdated = () => {
      loadLiveReviews();
    };

    window.addEventListener('anika_reviews_updated', handleReviewsUpdated);
    return () => {
      window.removeEventListener('anika_reviews_updated', handleReviewsUpdated);
    };
  }, [currentRoute]);

  const handleAddNewReview = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
  };

  const handleSelectProjectForInquiry = (projectName: string) => {
    setPreFilledCallback(`Inquiry for project: ${projectName}`);
  };

  const handleSelectServiceForInquiry = (serviceTitle: string) => {
    setPreFilledCallback(`Inquiry for service: ${serviceTitle}`);
  };

  const handleScrollToProjects = () => {
    const projectsEl = document.getElementById('projects');
    projectsEl?.scrollIntoView({ behavior: 'smooth' });
  };

  // Route 1: Hidden Login Page (/login)
  if (currentRoute === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateHome={() => navigate('home')}
      />
    );
  }

  // Route 2: Client Project Dashboard (/dashboard or /dashbord)
  // Protected Guard: If not actively authenticated in this session, strictly challenge with LoginPage
  if (currentRoute === 'dashboard') {
    if (!clientSession) {
      return (
        <LoginPage
          initialNotice="Access Restricted: You must enter credentials to view the client dashboard."
          onLoginSuccess={handleLoginSuccess}
          onNavigateHome={() => navigate('home')}
        />
      );
    }

    return (
      <ClientDashboard
        session={clientSession}
        onLogout={handleLogout}
        onNavigateHome={() => navigate('home')}
      />
    );
  }

  // Route 3: Public Website (/ or any other path)
  return (
    <div className="min-h-screen flex flex-col bg-brand-warmBg text-brand-navy selection:bg-brand-goldLight selection:text-brand-deepNavy">
      {/* Main Responsive Header (Top Bar Contract) */}
      <Navbar
        onOpenReviewModal={() => setIsReviewModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onExploreProjects={handleScrollToProjects}
        />

        {/* About Section */}
        <AboutSection />

        {/* Services & Capabilities Section */}
        <ServicesSection
          onSelectService={(service) => setSelectedService(service)}
        />

        {/* YouTube Video Gallery Section */}
        <YouTubeVideosSection />

        {/* Delivered & Ongoing Projects Section */}
        <ProjectsSection
          onSelectProject={(project) => setSelectedProject(project)}
          onEnquireProject={(projectName) => {
            handleSelectProjectForInquiry(projectName);
            const cb = document.getElementById('callback');
            cb?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Customer Reviews & Feedback Wall */}
        <ReviewsSection
          reviews={reviews}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
        />

        {/* Distinction & Why Anika Section */}
        <WhyUsSection />

        {/* Lead Capture / Request Callback */}
        <CallbackSection preFilledInterest={preFilledCallback} />

        {/* Office Location & Contact Details */}
        <ContactSection />
      </main>

      {/* Comprehensive Corporate Footer with discrete Client Portal link */}
      <Footer onNavigateLogin={() => navigate('login')} />

      {/* Sticky Mobile Quick Action Bar (<=15% Viewport Cap) */}
      <MobileQuickBar onOpenReviewModal={() => setIsReviewModalOpen(true)} />

      {/* Modals */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectForInquiry={handleSelectProjectForInquiry}
      />

      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onSelectService={handleSelectServiceForInquiry}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={handleAddNewReview}
      />
    </div>
  );
}
