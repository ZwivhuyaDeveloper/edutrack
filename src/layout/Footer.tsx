import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/logo_white.png';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, X } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Demo', href: '#demo' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Blog', href: '#blog' },
      { name: 'Press', href: '#press' },
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Documentation', href: '#docs' },
      { name: 'API Status', href: '#status' },
      { name: 'Contact Us', href: '#contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'GDPR', href: '#gdpr' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ];

  return (
    <footer className="font-sans bg-primary border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-8 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image 
                  src={logo} 
                  alt="EduTrack Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-bold text-white">EduTrack</span>
                <span className="text-xs sm:text-sm text-white font-semibold tracking-widest">AI SOFTWARE</span>
              </div>
            </div>
            <p className="text-gray-100 text-md sm:text-base leading-relaxed max-w-md">
              Empowering educators with intelligent tracking and analytics solutions. 
              Transform your educational institution with data-driven insights and 
              streamlined administrative processes.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-100">
                <Mail className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span className="text-md lg:text-sm sm:text-base">info@edutrack-ai.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-100">
                <Mail className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span className="text-md lg:text-sm sm:text-base">support@edutrack-ai.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-100">
                <Phone className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span className="text-md lg:text-sm sm:text-base">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-100">
                <MapPin className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" />
                <span className="text-md lg:text-sm sm:text-base">Cape Town, South Africa</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-lg font-semibold text-white">Product</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-100 hover:text-teal-300 transition-colors duration-200 text-md sm:text-base py-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-xl sm:text-lg font-semibold text-white">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-100 hover:text-teal-300 transition-colors duration-200 text-md sm:text-base py-1 inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal Links */}
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-lg font-semibold text-white mb-3 sm:mb-4">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-100 hover:text-teal-300 transition-colors duration-200 text-md sm:text-base py-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl sm:text-lg font-semibold text-white mb-3 sm:mb-4">Legal</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-100 hover:text-teal-300 transition-colors duration-200 text-md sm:text-base py-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-300/30 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-gray-100 text-xs sm:text-sm text-center sm:text-left">
              © 2025 EduTrack AI Software. All rights reserved.
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/50 rounded-full flex items-center justify-center text-white hover:bg-primary hover:text-primary transition-all duration-200 border border-primary/30 hover:border-primary active:scale-95"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
