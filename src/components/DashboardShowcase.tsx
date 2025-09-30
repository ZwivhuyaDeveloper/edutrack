import React from 'react';
import Image from 'next/image';

interface DashboardShowcaseProps {
  className?: string;
}

export default function DashboardShowcase({ className = "" }: DashboardShowcaseProps) {
  const dashboards = [
    {
      title: "Main Dashboard",
      description: "Comprehensive overview of student performance, attendance, and key metrics at a glance.",
      image: "/assets/MAIN_PAGE.png",
      alt: "Main Dashboard Overview"
    },
    {
      title: "Assignments Management",
      description: "Streamlined assignment creation, distribution, and grading system for teachers.",
      image: "/assets/ASSIGNMENTS_PAGE.png",
      alt: "Assignments Management Interface"
    },
    {
      title: "Message Dashboard",
      description: "Centralized communication hub connecting principals, teachers, parents, and students.",
      image: "/assets/MESSAGE_DASHBOARD.png",
      alt: "Message Communication Dashboard"
    },
    {
      title: "Analytics & Reports",
      description: "Detailed AI-powered insights and comprehensive reports on student progress.",
      image: "/assets/REPORT_PAGE.png",
      alt: "Analytics and Reports Dashboard"
    }
  ];

  return (
    <div className={`w-full ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Platform <span className="text-primary">Dashboard</span> Tour
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore our intuitive and powerful dashboard interfaces designed to streamline educational management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {dashboards.map((dashboard, index) => (
          <div 
            key={index}
            className="group relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {/* Image Container */}
            <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
              <Image
                src={dashboard.image}
                alt={dashboard.alt}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={100}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                <h3 className="text-xl font-bold text-gray-900">{dashboard.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{dashboard.description}</p>
              
              {/* Interactive indicator */}
              <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:underline">
                <span>Explore interface</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center bg-primary/10 text-primary px-6 py-3 rounded-full">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-medium">Interactive demo available soon</span>
        </div>
      </div>
    </div>
  );
}
