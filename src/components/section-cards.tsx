import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"

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
import { Dot, SquareCheckBig, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { List } from "@radix-ui/react-tabs";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="font-sans @container/card">
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
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
    </div>
  )
}
