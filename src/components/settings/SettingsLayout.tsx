import { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SettingsTab {
  value: string
  label: string
  content: ReactNode
}

interface SettingsLayoutProps {
  title: string
  description: string
  tabs: SettingsTab[]
  defaultTab?: string
}

export function SettingsLayout({
  title,
  description,
  tabs,
  defaultTab
}: SettingsLayoutProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab || tabs[0]?.value} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-6 mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
