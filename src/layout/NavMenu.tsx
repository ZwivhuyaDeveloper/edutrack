"use client";
import React, { useState } from "react";
import { MenuItem } from "../components/ui/navbar-menu";
import logo from "@/assets/frame_white.png";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Close menu when navigating to prevent overlap
    if (!isMenuOpen) {
      setActive(null);
    }
  };

  // Close menu when clicking outside
  const handleOutsideClick = React.useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest('[data-nav-container]') && isMenuOpen) {
      setIsMenuOpen(false);
      setActive(null);
    }
  }, [isMenuOpen]);

  // Close menu on escape key
  const handleEscapeKey = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
      setActive(null);
    }
  }, [isMenuOpen]);

  React.useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, handleOutsideClick, handleEscapeKey]);
  
  return (
    <div
      data-nav-container
      className={cn("fixed font-sans top-0 inset-x-0 max-w-full mx-auto py-4 z-50 bg-white/95 backdrop-blur-sm border-b border-none", className)}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-40 ">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex flex-row space-x-0 items-center">
            <Image src={logo} alt="Logo" quality={100} width={45} height={100} className="sm:w-[50px] sm:h-[45
              px] md:w-[50px] md:h-[60px] p-0" />
            <div className="flex justify-center  flex-col items-start ml-2 sm:ml-3">
              <span className="text-lg sm:text-xl md:text-2xl font-bold">EduTrack</span>
              <span className="text-xs sm:text-sm text-black font-semibold tracking-widest">AI SOFTWARE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            <Link href="/features" className="text-base md:text-md font-semibold">
              Features
            </Link>
            <Link href="/about" className="text-base md:text-md font-semibold">
              About us
            </Link>
            <Link href="/pricing" className="text-base md:text-md font-semibold">
              Pricing
            </Link>
            <Link href="/learn-more" className="text-base md:text-md font-semibold">
              Learn More
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Button variant="outline" className="text-sm md:text-base font-semibold text-primary border-2 border-primary px-4 py-2">
              Login
            </Button>
            <Button variant="default" className="text-sm md:text-base font-semibold bg-primary px-4 py-2">
              Register
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-3 bg-primary text-white rounded-md hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        id="mobile-menu"
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/98 border-t border-gray-200 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col space-y-1 py-4">
            <button
              onClick={() => {
                setActive("Features");
                setIsMenuOpen(false);
              }}
              className={`text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-1 ${active === "Features" ? "text-teal-700 bg-teal-50 border-l-4 border-teal-700" : "text-gray-700 hover:text-teal-700 hover:bg-gray-50 hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between">
                <span>Features</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${active === "Features" ? "rotate-90 text-teal-700" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => {
                setActive("About us");
                setIsMenuOpen(false);
              }}
              className={`text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-1 ${active === "About us" ? "text-primary bg-primary border-l-4 border-primary" : "text-gray-700 hover:text-primary hover:bg-gray-50 hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between">
                <span>About us</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${active === "About us" ? "rotate-90 text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => {
                setActive("Pricing");
                setIsMenuOpen(false);
              }}
              className={`text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-1 ${active === "Pricing" ? "text-primary bg-primary border-l-4 border-primary" : "text-gray-700 hover:text-primary hover:bg-gray-50 hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between">
                <span>Pricing</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${active === "Pricing" ? "rotate-90 text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => {
                setActive("Learn More");
                setIsMenuOpen(false);
              }}
              className={`text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-1 ${active === "Learn More" ? "text-primary bg-primary border-l-4 border-primary" : "text-gray-700 hover:text-primary hover:bg-gray-50 hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between">
                <span>Learn More</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${active === "Learn More" ? "rotate-90 text-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
          <div className="flex flex-col space-y-3 px-4 py-4 border-t border-gray-200 bg-gray-50/50">
            <Button 
              variant="outline" 
              className="w-full text-base font-semibold text-primary border-2 border-primary py-3 transition-all duration-200 hover:bg-primary hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Button>
            <Button 
              variant="default" 
              className="w-full text-base font-semibold bg-primary py-3 transition-all duration-200 hover:bg-primary hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setIsMenuOpen(false)}
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
