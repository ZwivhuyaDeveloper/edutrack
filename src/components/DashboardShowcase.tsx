"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Monitor, Users, BookOpen, Crown, User } from 'lucide-react';
import First from '@/assets/MAIN_PAGE.png';
import Second from '@/assets/ASSIGNMENTS_PAGE.png';
import Third from '@/assets/MESSAGE_DASHBOARD.png';
import Fourth from '@/assets/REPORT_PAGE.png';

interface DashboardShowcaseProps {
  className?: string;
}

export default function DashboardShowcase({ className = "" }: DashboardShowcaseProps) {
  const [activeRole, setActiveRole] = useState<'learner' | 'teacher' | 'principal' | 'parent'>('learner');

  const roleData = {
    learner: {
      title: "Student Dashboard",
      description: "Empowering students with personalized learning paths and progress tracking.",
      icon: User,
      dashboards: [
        {
          title: "Personal Learning Dashboard",
          description: "Track your grades, assignments, and learning progress in one unified view.",
          image: First,
          alt: "Student Personal Dashboard"
        },
        {
          title: "Assignment Tracker",
          description: "Stay on top of deadlines, submit work, and receive feedback instantly.",
          image: Second,
          alt: "Student Assignment Interface"
        },
        {
          title: "Communication Center",
          description: "Connect with teachers and peers through integrated messaging and collaboration tools.",
          image: Third,
          alt: "Student Communication Hub"
        },
        {
          title: "Progress Analytics",
          description: "Visual insights into your academic performance and growth over time.",
          image: Fourth,
          alt: "Student Progress Reports"
        }
      ]
    },
    teacher: {
      title: "Teacher Dashboard",
      description: "Streamlined classroom management and teaching tools for educators.",
      icon: BookOpen,
      dashboards: [
        {
          title: "Classroom Overview",
          description: "Monitor student performance, attendance, and engagement across all classes.",
          image: First,
          alt: "Teacher Classroom Dashboard"
        },
        {
          title: "Assignment Management",
          description: "Create, distribute, and grade assignments efficiently with automated workflows.",
          image: Second,
          alt: "Teacher Assignment System"
        },
        {
          title: "Student Communication",
          description: "Communicate with students and parents through organized messaging channels.",
          image: Third,
          alt: "Teacher Communication Portal"
        },
        {
          title: "Performance Analytics",
          description: "Detailed insights into class and individual student performance metrics.",
          image: Fourth,
          alt: "Teacher Analytics Dashboard"
        }
      ]
    },
    principal: {
      title: "Principal Dashboard",
      description: "Comprehensive school administration and oversight tools for leadership.",
      icon: Crown,
      dashboards: [
        {
          title: "School Overview",
          description: "Holistic view of school performance, attendance, and key institutional metrics.",
          image: First,
          alt: "Principal School Dashboard"
        },
        {
          title: "Staff Management",
          description: "Manage teacher assignments, performance reviews, and professional development.",
          image: Second,
          alt: "Principal Staff Management"
        },
        {
          title: "Administrative Communications",
          description: "Coordinate with staff, parents, and district leadership through centralized messaging.",
          image: Third,
          alt: "Principal Communication Center"
        },
        {
          title: "School Analytics",
          description: "Comprehensive reports on school performance, trends, and improvement areas.",
          image: Fourth,
          alt: "Principal Analytics Portal"
        }
      ]
    },
    parent: {
      title: "Parent Dashboard",
      description: "Stay connected and informed about your child's educational journey.",
      icon: Users,
      dashboards: [
        {
          title: "Child Progress Overview",
          description: "Monitor your child's academic performance, attendance, and behavior in real-time.",
          image: First,
          alt: "Parent Child Dashboard"
        },
        {
          title: "Assignment & Grades",
          description: "Track upcoming assignments, grades, and teacher feedback for all subjects.",
          image: Second,
          alt: "Parent Assignment Tracker"
        },
        {
          title: "Teacher Communication",
          description: "Direct messaging with teachers and school staff for seamless collaboration.",
          image: Third,
          alt: "Parent Communication Hub"
        },
        {
          title: "Progress Reports",
          description: "Detailed reports and insights into your child's academic growth and development.",
          image: Fourth,
          alt: "Parent Progress Reports"
        }
      ]
    }
  };

  const currentRole = roleData[activeRole];

  return (
    <div className={`font-sans w-full px-4 mb-20 ${className}`}>
      <div className="text-center mb-12">
        <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
          <Monitor className="w-4 h-4 mr-2" />
          <span className="text-sm font-semibold">Interface Showcase</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Platform <span className="text-primary">Dashboard</span> Tour
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore our intuitive and powerful dashboard interfaces designed to streamline educational management.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-gray-100 rounded-xl p-1 shadow-inner">
          {Object.entries(roleData).map(([key, role]) => {
            const Icon = role.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveRole(key as 'learner' | 'teacher' | 'principal' | 'parent')}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  activeRole === key
                    ? 'bg-white text-primary shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="capitalize">{key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Role Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <currentRole.icon className="w-4 h-4 mr-2" />
          <span className="text-sm font-semibold">{currentRole.title}</span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {currentRole.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {currentRole.dashboards.map((dashboard, index) => (
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
