"use client"

import { useUser } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { TermStatusCard } from "./term-status-card";
import { StudentProgressCard } from "./student-progress-card";
import { MessagesCard } from "./messages-card";

interface DatabaseUser {
  id: string
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'PRINCIPAL'
}

export function SectionCards() {
  const { user: clerkUser, isLoaded } = useUser()
  const [dbUser, setDbUser] = useState<DatabaseUser | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!clerkUser) return
      
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          setDbUser(data.user)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    if (clerkUser) {
      fetchUserData()
    }
  }, [clerkUser])

  // Mock message data for each role
  const getMessagesForRole = () => {
    if (!dbUser) return []

    switch (dbUser.role) {
      case 'STUDENT':
        return [
          {
            id: '1',
            sender: 'Sarah Teacher',
            senderRole: 'teacher',
            avatar: '👩‍🏫',
            subject: 'Assignment Due Tomorrow',
            message: 'Don\'t forget to submit your math homework by 9 AM tomorrow.',
            time: '2 hours ago',
            unread: true,
            priority: 'high'
          },
          {
            id: '2',
            sender: 'Mike Principal',
            senderRole: 'principal',
            avatar: '👨‍💼',
            subject: 'School Announcement',
            message: 'Parent-teacher conference scheduled for next Friday.',
            time: '1 day ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '3',
            sender: 'Lisa Parent',
            senderRole: 'parent',
            avatar: '👩‍👧‍👦',
            subject: 'Great job on your test!',
            message: 'I\'m so proud of your recent math test score. Keep it up!',
            time: '2 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '4',
            sender: 'David Teacher',
            senderRole: 'teacher',
            avatar: '👨‍🏫',
            subject: 'Science Project Update',
            message: 'Remember, your science fair project is due next Monday. Let me know if you need help!',
            time: '3 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '5',
            sender: 'Emily Counselor',
            senderRole: 'teacher',
            avatar: '👩‍💼',
            subject: 'Career Guidance Session',
            message: 'You\'re invited to attend our career guidance workshop next Thursday after school.',
            time: '4 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '6',
            sender: 'Alex Student',
            senderRole: 'learner',
            avatar: '👨‍🎓',
            subject: 'Study group for math test',
            message: 'Hey! Want to join our study group for the upcoming math test? We meet after school.',
            time: '5 days ago',
            unread: false,
            priority: 'normal'
          }
        ]

      case 'TEACHER':
        return [
          {
            id: '1',
            sender: 'John Student',
            senderRole: 'learner',
            avatar: '👨‍🎓',
            subject: 'Question about homework',
            message: 'I need help with question 5 on the algebra worksheet.',
            time: '30 minutes ago',
            unread: true,
            priority: 'high'
          },
          {
            id: '2',
            sender: 'Lisa Parent',
            senderRole: 'parent',
            avatar: '👩‍👧‍👦',
            subject: 'Parent-teacher conference',
            message: 'Can we schedule a meeting to discuss John\'s progress?',
            time: '3 hours ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '3',
            sender: 'Mike Principal',
            senderRole: 'principal',
            avatar: '👨‍💼',
            subject: 'Staff Meeting Reminder',
            message: 'Monthly staff meeting is scheduled for tomorrow at 3 PM.',
            time: '1 day ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '4',
            sender: 'Emma Student',
            senderRole: 'learner',
            avatar: '👩‍🎓',
            subject: 'Makeup test request',
            message: 'I missed the test last week due to illness. Can I take a makeup test?',
            time: '2 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '5',
            sender: 'Robert Parent',
            senderRole: 'parent',
            avatar: '👨‍👧‍👦',
            subject: 'Homework concerns',
            message: 'My daughter is struggling with the recent physics assignments. Can we discuss?',
            time: '3 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '6',
            sender: 'Susan Teacher',
            senderRole: 'teacher',
            avatar: '👩‍🏫',
            subject: 'Curriculum planning',
            message: 'Let\'s coordinate our lesson plans for the upcoming unit on World History.',
            time: '4 days ago',
            unread: false,
            priority: 'normal'
          }
        ]

      case 'PRINCIPAL':
        return [
          {
            id: '1',
            sender: 'Sarah Teacher',
            senderRole: 'teacher',
            avatar: '👩‍🏫',
            subject: 'Budget Request',
            message: 'Requesting approval for new classroom supplies budget.',
            time: '1 hour ago',
            unread: true,
            priority: 'high'
          },
          {
            id: '2',
            sender: 'Lisa Parent',
            senderRole: 'parent',
            avatar: '👩‍👧‍👦',
            subject: 'School Safety Concern',
            message: 'Concerned about traffic safety during student pickup times.',
            time: '4 hours ago',
            unread: false,
            priority: 'high'
          },
          {
            id: '3',
            sender: 'School Board',
            senderRole: 'admin',
            avatar: '🏫',
            subject: 'Board Meeting Minutes',
            message: 'Please review the minutes from last week\'s board meeting.',
            time: '2 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '4',
            sender: 'Tom Teacher',
            senderRole: 'teacher',
            avatar: '👨‍🏫',
            subject: 'Field Trip Permission',
            message: 'Requesting approval for the 8th grade field trip to the science museum next month.',
            time: '3 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '5',
            sender: 'Maria Parent',
            senderRole: 'parent',
            avatar: '👩‍👧‍👦',
            subject: 'School Lunch Program',
            message: 'I\'d like to discuss improving the variety in our school lunch program.',
            time: '4 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '6',
            sender: 'District Office',
            senderRole: 'admin',
            avatar: '🏢',
            subject: 'Annual Review Preparation',
            message: 'Please prepare your annual school performance report for the district review.',
            time: '5 days ago',
            unread: false,
            priority: 'high'
          }
        ]

      case 'PARENT':
        return [
          {
            id: '1',
            sender: 'Sarah Teacher',
            senderRole: 'teacher',
            avatar: '👩‍🏫',
            subject: 'John\'s Progress Report',
            message: 'John is doing excellent in mathematics this semester.',
            time: '1 hour ago',
            unread: true,
            priority: 'normal'
          },
          {
            id: '2',
            sender: 'Mike Principal',
            senderRole: 'principal',
            avatar: '👨‍💼',
            subject: 'School Newsletter',
            message: 'Check out this month\'s school activities and achievements.',
            time: '3 hours ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '3',
            sender: 'Jane Student',
            senderRole: 'learner',
            avatar: '👩‍🎓',
            subject: 'Thanks for helping with homework',
            message: 'Thank you for helping me understand the algebra problems!',
            time: '1 day ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '4',
            sender: 'David Teacher',
            senderRole: 'teacher',
            avatar: '👨‍🏫',
            subject: 'Upcoming Science Fair',
            message: 'Jane\'s science project on renewable energy looks fantastic! She\'s very enthusiastic about it.',
            time: '2 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '5',
            sender: 'Emily Counselor',
            senderRole: 'teacher',
            avatar: '👩‍💼',
            subject: 'College Preparation Workshop',
            message: 'We\'re hosting a college preparation workshop for 11th and 12th graders. Would Jane be interested?',
            time: '3 days ago',
            unread: false,
            priority: 'normal'
          },
          {
            id: '6',
            sender: 'School Nurse',
            senderRole: 'admin',
            avatar: '👩‍⚕️',
            subject: 'Health and Wellness Update',
            message: 'Reminder: All students need updated immunization records by the end of this month.',
            time: '4 days ago',
            unread: false,
            priority: 'normal'
          }
        ]

      default:
        return []
    }
  }

  const messages = getMessagesForRole()

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <TermStatusCard />
      <StudentProgressCard />
      <MessagesCard messages={messages} />
    </div>
  )
}
