"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function MonthYearPicker({
  value,
  onChange,
  className,
  placeholder = "Select Month/Year"
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const date = value ? parseISO(value) : new Date()
  const displayDate = value ? parseISO(value) : undefined
  const [currentYear, setCurrentYear] = React.useState(date.getFullYear())

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1)
    onChange(format(newDate, "yyyy-MM-dd"))
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {displayDate && isValid(displayDate) ? format(displayDate, "MMMM yyyy") : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="flex items-center justify-between pb-4">
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={() => setCurrentYear(prev => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{currentYear}</div>
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={() => setCurrentYear(prev => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, idx) => (
            <Button
              key={month}
              variant={displayDate && displayDate.getMonth() === idx && displayDate.getFullYear() === currentYear ? "default" : "ghost"}
              className={cn(
                "h-9 w-full text-xs font-normal",
                displayDate && displayDate.getMonth() === idx && displayDate.getFullYear() === currentYear && "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
              )}
              onClick={() => handleMonthSelect(idx)}
            >
              {month.slice(0, 3)}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
