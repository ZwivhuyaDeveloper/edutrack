"use client"

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Check, X, Star, ArrowRight, Globe } from 'lucide-react';

interface FlagProps {
  countryCode: string;
  className?: string;
}

const Flag: React.FC<FlagProps> = ({ countryCode, className = '' }) => {
  // Country code to flagcdn.com code mapping
  const flagCodeMap: Record<string, string> = {
    'ZA': 'za',
    'US': 'us',
    'GB': 'gb',
    'EU': 'eu',
    'AU': 'au',
    'CA': 'ca'
  };

  const flagCode = flagCodeMap[countryCode] || countryCode.toLowerCase();
  
  // Country names for alt text
  const countryNames: Record<string, string> = {
    'ZA': 'South Africa',
    'US': 'United States',
    'GB': 'United Kingdom',
    'EU': 'European Union',
    'AU': 'Australia',
    'CA': 'Canada'
  };

  const countryName = countryNames[countryCode] || countryCode;
  
  return (
    <Image
      src={`https://flagcdn.com/16x12/${flagCode}.png`}
      alt={`${countryName} flag`}
      width={16}
      height={12}
      className={`inline-block align-middle ${className}`}
      onError={(e) => {
        // Fallback to emoji if image fails to load
        const fallbackMap: Record<string, string> = {
          'ZA': '🇿🇦',
          'US': '🇺🇸',
          'GB': '🇬🇧',
          'EU': '🇪🇺',
          'AU': '🇦🇺',
          'CA': '🇨🇦'
        };
        const fallback = fallbackMap[countryCode] || '🏳️';
        const span = document.createElement('span');
        span.textContent = fallback;
        span.className = `inline-block align-middle ${className}`;
        span.setAttribute('aria-label', `${countryName} flag`);
        span.setAttribute('role', 'img');
        e.currentTarget.parentNode?.replaceChild(span, e.currentTarget);
      }}
    />
  );
};

interface PricingTier {
  name: string;
  basePrice: number; // Base price in ZAR
  period: string;
  description: string;
  features: string[];
  notIncluded: string[];
  highlighted: boolean;
  popular?: boolean;
  ctaText: string;
}

interface Country {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  exchangeRate: number; // Rate from ZAR to this currency
  flag: string;
}

const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedCountry, setSelectedCountry] = useState<string>('ZA');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const countries: Country[] = [
    {
      code: 'ZA',
      name: 'South Africa',
      currency: 'ZAR',
      symbol: 'R',
      exchangeRate: 1,
      flag: '🇿🇦'
    },
    {
      code: 'US',
      name: 'United States',
      currency: 'USD',
      symbol: '$',
      exchangeRate: 0.055,
      flag: '🇺🇸'
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      currency: 'GBP',
      symbol: '£',
      exchangeRate: 0.043,
      flag: '🇬🇧'
    },
    {
      code: 'EU',
      name: 'European Union',
      currency: 'EUR',
      symbol: '€',
      exchangeRate: 0.050,
      flag: '🇪🇺'
    },
    {
      code: 'AU',
      name: 'Australia',
      currency: 'AUD',
      symbol: 'A$',
      exchangeRate: 0.082,
      flag: '🇦🇺'
    },
    {
      code: 'CA',
      name: 'Canada',
      currency: 'CAD',
      symbol: 'C$',
      exchangeRate: 0.075,
      flag: '🇨🇦'
    }
  ];
  
  const formatPrice = (price: number, country: Country): string => {
    const convertedPrice = price * country.exchangeRate;
    return `${country.symbol}${convertedPrice.toFixed(2)}`;
  };
  
  const getCurrentCountry = (): Country => {
    return countries.find(c => c.code === selectedCountry) || countries[0];
  };

  const pricingTiers: PricingTier[] = [
    {
      name: "Professional",
      basePrice: billingCycle === 'monthly' ? 16.70 : 200.00,
      period: billingCycle === 'monthly' ? "Monthly" : "Yearly",
      description: billingCycle === 'monthly' 
        ? "Flexible monthly plan for schools wanting to try our comprehensive platform"
        : "Best value annual plan with 2 months free and priority features",
      features: billingCycle === 'monthly' ? [
        "Per Learner Per Month",
        "Advanced attendance tracking",
        "Comprehensive grade book",
        "Parent & student portals",
        "Advanced reporting & analytics",
        "AI-powered insights",
        "Email & chat support",
        "Mobile app access",
        "Basic integrations",
        "Custom branding"
      ] : [
        "Per Learner Per Year (Save 17%)",
        "Everything in Monthly, plus:",
        "Priority email & chat support",
        "Advanced AI features",
        "Custom integrations",
        "Early access to new features",
        "Dedicated onboarding session",
        "Monthly performance reports",
        "Custom branding",
        "Mobile app access"
      ],
      notIncluded: billingCycle === 'monthly' ? [
        "Priority support",
        "Advanced AI features",
        "Custom integrations",
        "White-label solution",
        "Custom development"
      ] : [
        "White-label solution",
        "Custom development",
        "API access",
        "SLA guarantee"
      ],
      highlighted: true,
      popular: true,
      ctaText: billingCycle === 'monthly' ? "Start Free Trial" : "Get Started"
    }
  ];

  return (
    <div className="font-sans w-full px-4 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold">Flexible Pricing Plans</span>
          </div>
          <h2 className="text-4xl md:text-4xl font-bold text-gray-900 mb-6">
            Choose the Perfect Plan for Your
            <span className="text-primary"> Educational Needs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Scalable solutions designed to grow with your institution. From small classrooms to entire districts, 
            we have the perfect plan to enhance learning outcomes and streamline administration.
          </p>
          
          {/* Country Selector */}
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-5 h-5 text-gray-500 mr-2" />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="font-sans bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent min-w-[200px] flex items-center justify-between"
                aria-label="Select country and currency"
                aria-expanded={isDropdownOpen ? 'true' : 'false'}
              >
                <div className="flex items-center">
                  <Flag countryCode={selectedCountry} className="mr-2" />
                  <span>{getCurrentCountry().name} ({getCurrentCountry().currency})</span>
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center hover:bg-gray-50 transition-colors duration-150 ${
                        selectedCountry === country.code ? 'bg-primary/10 text-primary' : 'text-gray-700'
                      }`}
                    >
                      <Flag countryCode={country.code} className="mr-3" />
                      <span>{country.name}</span>
                      <span className="ml-auto text-gray-500">({country.currency})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingCycle === 'annual' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual Billing
              <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 md:mx-30 lg:mx-80 mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
                tier.highlighted
                  ? 'bg-white border-2 border-primary shadow-lg scale-105'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-bold text-primary">
                    {formatPrice(tier.basePrice, getCurrentCountry())}
                  </span>
                  <span className="text-gray-600 text-lg">{tier.period}</span>
                  <div className="text-sm text-gray-500 mt-1">
                    {getCurrentCountry().currency}
                  </div>
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              {/* CTA Button */}
              <div className="mb-8">
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-primary text-white hover:bg-primary/90 transform hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.ctaText}
                  {tier.ctaText !== "Contact Sales" && (
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What&apos;s Included:</h4>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {tier.notIncluded.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Not Included:</h4>
                    <ul className="space-y-3">
                      {tier.notIncluded.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Something Custom?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We understand that every educational institution has unique requirements. 
            Our team can work with you to create a customized solution that fits your specific needs, 
            budget, and integration requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Schedule a Demo
            </button>
            <button className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/10 transition-colors">
              Contact Our Team
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-8">Trusted by educational institutions worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-500">Secure</div>
            <div className="text-2xl font-bold text-gray-500">Reliable</div>
            <div className="text-2xl font-bold text-gray-500">Scalable</div>
            <div className="text-2xl font-bold text-gray-500">24/7 Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
