"use client"

import React from 'react';
import { CheckCircle, XCircle, TrendingUp, Users, BookOpen, AlertTriangle } from 'lucide-react';

interface ComparisonItem {
  problem: string;
  currentSolution: string;
  ourSolution: string;
  impact: 'high' | 'medium' | 'low';
}

const EducationComparison: React.FC = () => {
  const comparisonData: ComparisonItem[] = [
    {
      problem: "Manual Attendance Tracking",
      currentSolution: "Paper registers, spreadsheets, time-consuming manual entry",
      ourSolution: "Automated digital attendance with biometric integration and real-time reporting",
      impact: 'high'
    },
    {
      problem: "Grade Management",
      currentSolution: "Disconnected spreadsheets, calculation errors, delayed reporting",
      ourSolution: "Centralized grade book with automatic calculations, instant report generation",
      impact: 'high'
    },
    {
      problem: "Parent Communication",
      currentSolution: "Occasional meetings, phone calls, lost communication",
      ourSolution: "Real-time parent portal with instant notifications and progress tracking",
      impact: 'high'
    },
    {
      problem: "Administrative Workload",
      currentSolution: "Overwhelming paperwork, repetitive tasks, burnout",
      ourSolution: "AI-powered automation reducing administrative tasks by 70%",
      impact: 'high'
    },
    {
      problem: "Data Analytics",
      currentSolution: "Limited insights, reactive decision making, no trend analysis",
      ourSolution: "Advanced analytics with AI insights, predictive modeling, and performance tracking",
      impact: 'medium'
    },
    {
      problem: "Student Engagement",
      currentSolution: "Passive learning, limited interaction, disengagement",
      ourSolution: "Interactive dashboards, gamification, personalized learning paths",
      impact: 'medium'
    },
    {
      problem: "Resource Management",
      currentSolution: "Inefficient allocation, manual scheduling, resource conflicts",
      ourSolution: "Smart resource optimization, automated scheduling, conflict resolution",
      impact: 'medium'
    },
    {
      problem: "Compliance & Reporting",
      currentSolution: "Complex compliance requirements, manual reporting, audit risks",
      ourSolution: "Automated compliance tracking, one-click reporting, audit-ready documentation",
      impact: 'low'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-primary/10 text-primary border-primary';
      case 'medium': return 'bg-primary/10 text-primary border-primary';
      case 'low': return 'bg-primary/10 text-primary border-primary';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <section className="font-sans py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold">Education Transformation</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Current Challenges vs Our Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how EduTrack transforms educational management from manual, time-consuming processes 
            to streamlined, data-driven operations.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">70%</h3>
            <p className="text-gray-600">Time spent on administrative tasks</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">85%</h3>
            <p className="text-gray-600">Improvement in operational efficiency</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
            <p className="text-gray-600">Parent satisfaction with communication</p>
          </div>
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Challenge Area
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Current State
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                    EduTrack Solution
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Impact Level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.problem}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 text-sm">{item.currentSolution}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-primary text-sm font-medium">{item.ourSolution}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(item.impact)}`}>
                          {getImpactIcon(item.impact)}
                          <span className="ml-1 capitalize text-primary">{item.impact}</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Cards - Mobile */}
        <div className="lg:hidden space-y-6">
          {comparisonData.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">{item.problem}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(item.impact)}`}>
                    {getImpactIcon(item.impact)}
                    <span className="ml-1 capitalize text-primary">{item.impact}</span>
                  </span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-4 space-y-4">
                {/* Current State */}
                <div className="space-y-2">
                  <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <XCircle className="w-3 h-3 mr-1 text-red-500" />
                    Current State
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed pl-4 border-l-2 border-red-200">
                    {item.currentSolution}
                  </div>
                </div>
                
                {/* Solution */}
                <div className="space-y-2">
                  <div className="flex items-center text-xs font-medium text-primary uppercase tracking-wide">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    EduTrack Solution
                  </div>
                  <div className="text-primary text-sm font-medium leading-relaxed pl-4 border-l-2 border-primary/30">
                    {item.ourSolution}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Time Savings</h3>
            <p className="text-gray-600 text-sm">Reduce administrative workload by up to 70%</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Better Insights</h3>
            <p className="text-gray-600 text-sm">Data-driven decision making with AI analytics</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Improved Communication</h3>
            <p className="text-gray-600 text-sm">Real-time updates for parents and students</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Enhanced Learning</h3>
            <p className="text-gray-600 text-sm">Personalized education paths and engagement</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Institution?</h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Join thousands of educational institutions that have already revolutionized their operations with EduTrack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white/50 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EducationComparison;
