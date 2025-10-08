"use client"

import { useState, useEffect } from 'react'
import { DashboardStatCard, AlertBanner, ClassTile, AssignmentListItem } from '@/components/dashboard'
import { BookOpen, Users, ClipboardCheck, MessageSquare, Calendar, TrendingUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherHomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    pendingGrading: 0,
    unreadMessages: 0
  })
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // TODO: Replace with actual API calls
        // const response = await fetch('/api/dashboard/teacher/overview')
        // const data = await response.json()
        
        // Mock data for now
        setStats({
          totalClasses: 5,
          totalStudents: 120,
          pendingGrading: 23,
          unreadMessages: 8
        })

        setUpcomingClasses([
          {
            id: '1',
            name: 'Mathematics 101',
            grade: 'Grade 10',
            section: 'A',
            teacher: { name: 'You', avatar: '' },
            nextMeeting: {
              subject: 'Algebra',
              time: 'Today, 10:00 AM',
              room: 'Room 204'
            },
            subjectCount: 1,
            status: 'ACTIVE' as const
          }
        ])

        setPendingSubmissions([
          {
            id: '1',
            title: 'Algebra Assignment 3',
            subject: 'Mathematics',
            dueDate: new Date('2025-10-10'),
            maxPoints: 100,
            isSubmitted: false,
            href: '/dashboard/teacher/assignments/1'
          }
        ])

        setAlerts([
          {
            type: 'warning' as const,
            title: 'Attendance Reminder',
            message: 'You have 2 classes today without attendance records.'
          }
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertBanner
              key={index}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              dismissible
            />
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="My Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <DashboardStatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <DashboardStatCard
          title="Pending Grading"
          value={stats.pendingGrading}
          icon={ClipboardCheck}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <DashboardStatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          icon={MessageSquare}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today&apos;s Classes
          </h2>
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map(classItem => (
              <ClassTile
                key={classItem.id}
                {...classItem}
                href={`/dashboard/teacher/classes/${classItem.id}`}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No classes scheduled today</p>
          )}
        </div>

        {/* Pending Submissions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pending Grading
          </h2>
          {pendingSubmissions.length > 0 ? (
            <div className="space-y-3">
              {pendingSubmissions.map(assignment => (
                <AssignmentListItem key={assignment.id} {...assignment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">All caught up!</p>
          )}
        </div>
      </div>
    </div>
  )
}
