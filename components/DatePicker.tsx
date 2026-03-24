"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "MM/DD/YYYY"
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}) {
  const date = value ? parseISO(value) : undefined

  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value && date && isValid(date) ? format(date as Date, "MM/dd/yyyy") : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
