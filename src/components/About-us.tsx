import React from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { BentoGrid, BentoGridItem } from './ui/bento-grid';
import { Target, Users, Award, BookOpen, Heart, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import First from '@/assets/MAIN_PAGE.png';
import Second from '@/assets/ASSIGNMENTS_PAGE.png';
import Third from '@/assets/MESSAGE_DASHBOARD.png';
import Fourth from '@/assets/REPORT_PAGE.png';

export default function AboutUs() {
  // Mission & Vision data
  const missionData = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To empower educational institutions with intelligent tracking and analytics solutions that enhance learning outcomes and streamline administrative processes.",
      color: "text-teal-800"
    },
    {
      icon: Users,
      title: "Our Vision",
      description: "To become the leading provider of AI-powered educational software that transforms how schools manage student performance and engagement.",
      color: "text-teal-800"
    },
    {
      icon: Award,
      title: "Our Values",
      description: "Innovation, excellence, and student success drive everything we do. We believe in technology that serves education, not the other way around.",
      color: "text-teal-800"
    },
    {
      icon: Heart,
      title: "Our Commitment",
      description: "Dedicated to creating inclusive, accessible, and impactful educational technology that serves every student's unique learning journey.",
      color: "text-teal-800"
    },

  ];

  // Core values
  const coreValues = [
    {
      icon: BookOpen,
      title: "Educational Excellence",
      description: "Committed to providing tools that enhance teaching and learning experiences."
    },
    {
      icon: Heart,
      title: "Student-Centric",
      description: "Every feature is designed with the student's success and well-being at the core."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Continuously evolving with cutting-edge AI and machine learning technologies."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Building bridges between principals, teachers, parents, and learners."
    }
  ];

  // Features grid
  const features = [
    {
      header: (
        <div className="relative w-full h-full flex flex-col justify-end p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100">
            <div className="absolute inset-0 opacity-60" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(0, 0, 0, 0.1) 10px,
                rgba(0, 0, 0, 0.1) 20px
              )`
            }}></div>
          </div>
          <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center mb-2">
              <Target className="w-6 h-6 text-primary mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Real-time Performance</h3>
            </div>
            <p className="text-gray-700 text-sm">Track student progress instantly with comprehensive analytics and insights.</p>
          </div>
        </div>
      ),
      className: "md:col-span-1"
    },
    {
      header: (
        <div className="relative w-full h-full flex flex-col justify-end p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90">
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.1) 10px,
                rgba(255, 255, 255, 0.1) 20px
              )`
            }}></div>
          </div>
          <div className="relative z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="w-6 h-6 text-white mr-2" />
              <h3 className="text-xl font-bold text-white">Smart Attendance</h3>
            </div>
            <p className="text-gray-200 text-sm">Automated attendance tracking with pattern recognition and parent notifications.</p>
          </div>
        </div>
      ),
      className: "md:col-span-2"
    },
    {
      header: (
        <div className="relative w-full h-full flex flex-col justify-end p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/90">
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.1) 10px,
                rgba(255, 255, 255, 0.1) 20px
              )`
            }}></div>
          </div>
          <div className="relative z-10 bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Heart className="w-6 h-6 text-white mr-2" />
              <h3 className="text-xl font-bold text-white">Behavior Insights</h3>
            </div>
            <p className="text-gray-200 text-sm">Monitor and analyze student behavior patterns to support positive development.</p>
          </div>
        </div>
      ),
      className: "md:col-span-2"
    },
    {
      header: (
        <div className="relative w-full h-full flex flex-col justify-end p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100">
            <div className="absolute inset-0 opacity-50" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(0, 0, 0, 0.1) 10px,
                rgba(0, 0, 0, 0.1) 20px
              )`
            }}></div>
          </div>
          <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center mb-2">
              <Users className="w-6 h-6 text-primary mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Channelled Communication</h3>
            </div>
            <p className="text-gray-700 text-sm">Streamlined messaging between principals, teachers, parents, and students.</p>
          </div>
        </div>
      ),
      className: "md:col-span-1"
    }
  ];

  return (
    <div className="font-sans min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-4xl font-bold mb-6">
              About <span className="text-primary">EduTrack AI Software</span> 
            </h1>
            <h2 className="text-xl italic sm:text-2xl font-medium lg:text-3xl mb-8 max-w-4xl mx-auto text-teal-800">
              &ldquo;Smart Education Management&rdquo;  
            </h2>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto text-gray-800">
              Founded in 2025, EduTrack AI Software is revolutionizing how educational institutions manage student performance, 
              attendance, and communication through cutting-edge artificial intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Our <span className="text-primary">Story</span>
            </h2>
            <div className="space-y-4 text-gray-600">
              <p className="text-lg font-medium leading-relaxed">
                EduTrack AI Software was born from a simple yet powerful observation: educational institutions were drowning 
                in administrative tasks while struggling to provide personalized attention to students who needed it most.
              </p>
              <p className="text-lg font-medium leading-relaxed">
                Our team of educators, technologists, and data scientists came together with a shared vision: to create 
                an intelligent platform that would automate routine tasks while providing actionable insights that 
                could transform educational outcomes.
              </p>
              <p className="text-lg font-medium leading-relaxed">
                Today, EduTrack AI Software serves schools across South Africa and beyond, empowering principals, teachers, 
                parents, and learners with tools that make education more effective, efficient, and equitable.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {missionData.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 font-medium text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-primary">Core Values</span>
            </h2>
            <p className="text-xl font-medium text-gray-600 max-w-3xl mx-auto">
              The principles that guide every decision we make and every feature we build.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Makes Us <span className="text-primary">Different</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive approach to educational technology ensures no learner is left behind.
          </p>
        </div>
        
        <BentoGrid className="max-w-7xl mx-auto">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              header={item.header}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join hundreds of educational institutions already using EduTrack AI to enhance learning outcomes 
            and streamline administrative processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold text-lg py-4 px-8 rounded-lg">
              Get Started For Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white hover:text-primary font-bold text-lg py-4 px-8 rounded-lg">
              Contact
            </Button>
          </div>
        </div>
      </div>
    </div> 
  );
}
