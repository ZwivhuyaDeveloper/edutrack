import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import data from "../../data.json"

export default function HomePage() {
  return (
    <>
        <div className="flex flex-1 flex-col">
          <div className="@container/main bg-white rounded-3xl mt-3 flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-1 py-2 md:gap-6 md:py-6">
              <SectionCards />
            </div>
          </div>
        </div>
    </>
  )
}