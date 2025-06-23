'use client';

import { Header } from "@/components/header";
import LandingPageContent from "../features/landing/components/landing-page-content";
import { Footer } from "@/components/footer";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "@/lib/auth-client";

export default function LandingPage() {
  const { data: session, isPending: isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const hasVisited = sessionStorage.getItem('visitedLanding');

    if (session?.user && !hasVisited) {
      sessionStorage.setItem('visitedLanding', 'true');
      router.replace('/dashboard');
    }
  }, [session, isLoading, router]);

  return (
    <>
      <Header />
      <LandingPageContent />
      <Footer />
    </>
  );
}
