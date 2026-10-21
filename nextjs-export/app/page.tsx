'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ServicesSection } from '@/components/sections/ServicesSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { WhyUsSection } from '@/components/sections/WhyUsSection';
import { CallbackSection } from '@/components/sections/CallbackSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Footer } from '@/components/layout/Footer';
import { MobileQuickBar } from '@/components/layout/MobileQuickBar';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { ServiceDetailModal } from '@/components/modals/ServiceDetailModal';
import { ReviewModal } from '@/components/modals/ReviewModal';
import { Project, ServiceItem, Review } from '@/types';
import { INITIAL_REVIEWS } from '@/data/reviewsData';

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [preFilledCallback, setPreFilledCallback] = useState<string>('');

  useEffect(() => {
    // Fetch live approved reviews from Supabase API route
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch((err) => console.warn('Could not load reviews from Supabase API:', err));
  }, []);

  const handleScrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectProjectForInquiry = (projectName: string) => {
    setPreFilledCallback(`Inquiry for project: ${projectName}`);
    document.getElementById('callback')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectServiceForInquiry = (serviceTitle: string) => {
    setPreFilledCallback(`Inquiry for service: ${serviceTitle}`);
    document.getElementById('callback')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddNewReview = async (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
    } catch (err) {
      console.warn('Error saving review to Supabase API:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#0A1926]">
      <Navbar onOpenReviewModal={() => setIsReviewModalOpen(true)} />

      <main className="flex-1">
        <HeroSection onExploreProjects={handleScrollToProjects} />
        <AboutSection />
        <ServicesSection onSelectService={setSelectedService} />
        <ProjectsSection
          onSelectProject={setSelectedProject}
          onEnquireProject={handleSelectProjectForInquiry}
        />
        <ReviewsSection
          reviews={reviews}
          onOpenReviewModal={() => setIsReviewModalOpen(true)}
        />
        <WhyUsSection />
        <CallbackSection preFilledInterest={preFilledCallback} />
        <ContactSection />
      </main>

      <Footer onNavigateLogin={() => { window.location.href = '/login'; }} />
      <MobileQuickBar onOpenReviewModal={() => setIsReviewModalOpen(true)} />

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
