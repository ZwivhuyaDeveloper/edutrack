import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { ChartAreaInteractive } from "./chart-area-interactive";
import { Dot, MessageCircle, SquareCheckBig, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { List } from "@radix-ui/react-tabs";
import { ChartBarDefault } from "./chart-bar";
import { Button } from "./ui/button";

interface Message {
  id: string
  sender: string
  senderRole: string
  avatar: string
  subject: string
  message: string
  time: string
  unread: boolean
  priority: string
}

interface MessageItemProps {
  message: Message
}

function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02] ${
        message.unread ? 'bg-blue-50/70 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{message.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {message.sender}
              </p>
              {message.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              )}
              {message.priority === 'high' && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {message.senderRole === 'teacher' && '👩‍🏫 Teacher'}
            {message.senderRole === 'principal' && '👨‍💼 Principal'}
            {message.senderRole === 'parent' && '👩‍👧‍👦 Parent'}
            {message.senderRole === 'learner' && '👨‍🎓 Student'}
            {message.senderRole === 'admin' && '🏫 Admin'}
          </p>
          <p className="text-sm font-medium text-gray-800 mb-2 truncate">
            {message.subject}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {message.message}
          </p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1">
              {message.priority === 'high' && (
                <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                  High Priority
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {message.time}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SectionCards() {
  const { user } = useAuth()

  // Mock message data for each role
  const getMessagesForRole = () => {
    if (!user) return []

    switch (user.role) {
      case 'learner':
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

      case 'teacher':
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

      case 'principal':
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

      case 'parent':
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
      <Card className="font-sans @container/card border-1 shadow-none bg-zinc-100">
        <CardHeader>
          <ChartAreaInteractive />
        </CardHeader>
        <CardContent className="flex-col flex items-start gap-4 text-sm">
          <div className="flex-row flex w-full justify-between items-center gap-1.5 text-sm">
            <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
              <SquareCheckBig className="mr- size-7" /> Term Status
            </div>
            <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
              <Star fill="orange" className="mr- size-5 text-orange-300" /> 8/10
            </div>
          </div>
          <Separator orientation="horizontal" className="mr-2 h-px w-full bg-foreground/20" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-3 font-semibold text-md">
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> First Term
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">status:</p>
              <p className="text-red-500 font-semibold">Fail</p>
            </span>
          </div>

          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Second Term
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">status:</p>
              <p className="text-green-500 font-semibold">Pass</p>
            </span>
          </div>
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Third Term
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">status:</p>
              <p className="text-green-500 font-semibold">Pass</p>
            </span>
          </div>
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Fourth Term
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">status:</p>
              <p className="text-green-500 font-semibold">Pass</p>
            </span>
          </div>
        </CardFooter>
      </Card>
      <Card className="font-sans bg-zinc-100 @container/card">
        <CardHeader>
          <ChartBarDefault />
        </CardHeader>
        <CardContent className="flex-col flex items-start gap-4 text-sm">
          <div className="flex-row flex w-full justify-between items-center gap-1.5 text-sm">
            <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
              <SquareCheckBig className="mr- size-7" /> Term Status
            </div>
            <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
              <Star fill="orange" className="mr- size-5 text-orange-300" /> 8/10
            </div>
          </div>
          <Separator orientation="horizontal" className="mr-2 h-px w-full bg-foreground/20" />
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 font-semibold text-md">
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Mathematics
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">score:</p>
              <p className="text-primary font-semibold">75%</p>
            </span>
          </div>

          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> English
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">score:</p>
              <p className="text-primary font-semibold">75%</p>
            </span>
          </div>
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Social Studies
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">score:</p>
              <p className="text-primary font-semibold">75%</p>
            </span>
          </div>
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Science
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">score:</p>
              <p className="text-primary font-semibold">75%</p>
            </span>
          </div>
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Art
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">score:</p>
              <p className="text-primary font-semibold">75%</p>
            </span>
          </div>
          <div className="flex-row flex w-full justify-between items-center gap-1.5 ">
            <div className="flex-row flex w-full items-center gap-1.5">
              <Dot strokeWidth={5} className="mr- size-6 text-primary" /> Music
            </div>
            <span className="flex-row flex justify-between items-center gap-1.5">
              <p className="font-medium">score:</p>
              <p className="text-primary font-semibold">75%</p>
            </span>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
      <CardHeader className="flex-col flex items-start gap-4 text-sm">
          <div className="flex-row flex w-full justify-between items-center gap-1.5 text-sm">
            <CardTitle className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
              <MessageCircle  strokeWidth={3} className="mr- size-7" /> Messages
            </CardTitle>
            <Button className="line-clamp-1 text-md text-white flex items-center gap-2 font-semibold">
              view all
            </Button>
          </div>
          <Separator orientation="horizontal" className="mr-2 h-px w-full bg-foreground/20" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative max-h-96 overflow-hidden">
            <div className="max-h-96 overflow-y-auto space-y-3 p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mb-3" />
                  <p className="text-base text-muted-foreground font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Messages will appear here when you receive them</p>
                </div>
              ) : (
                <>
                  {/* Unread messages section */}
                  {messages.filter(msg => msg.unread).length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                          Unread ({messages.filter(msg => msg.unread).length})
                        </p>
                      </div>
                      <div className="space-y-3">
                        {messages.filter(msg => msg.unread).map((message) => (
                          <MessageItem key={message.id} message={message} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Read messages section */}
                  {messages.filter(msg => !msg.unread).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Earlier Messages
                        </p>
                      </div>
                      <div className="space-y-3">
                        {messages.filter(msg => !msg.unread).map((message) => (
                          <MessageItem key={message.id} message={message} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
