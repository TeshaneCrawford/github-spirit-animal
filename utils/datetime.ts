/**
 * Time periods for activity aggregation
 */
export const TimePeriods = {
  DAY: 1,
  WEEK: 7,
  MONTH: 30,
  YEAR: 365,
} as const

/**
 * Time of day classifications
 */
export const TimeOfDay = {
  MORNING: { start: 6, end: 12 },
  AFTERNOON: { start: 12, end: 18 },
  EVENING: { start: 18, end: 22 },
  NIGHT: { start: 22, end: 6 },
} as const

/**
 * Formats a date string to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0] ?? ''
}

/**
 * Gets the date range for a specific time period
 */
export function getDateRange(days: number): {
  start: Date
  end: Date
} {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start, end }
}

/**
 * Determines if a given hour is within specified time of day
 */
export function getTimeOfDay(hour: number): keyof typeof TimeOfDay {
  if (hour >= TimeOfDay.MORNING.start && hour < TimeOfDay.MORNING.end) return 'MORNING'
  if (hour >= TimeOfDay.AFTERNOON.start && hour < TimeOfDay.AFTERNOON.end) return 'AFTERNOON'
  if (hour >= TimeOfDay.EVENING.start && hour < TimeOfDay.EVENING.end) return 'EVENING'
  return 'NIGHT'
}

/**
 * Groups events by day for timeline visualization
 * Ensures type safety and proper date handling
 */
export function groupEventsByDay<T extends { created_at: string | null, type: string | null }>(
  events: T[],
  getValue: (event: T) => number,
): { date: string, count: number }[] {
  const grouped = events.reduce((acc: Record<string, number>, event) => {
    if (!event.created_at || !event.type) return acc
    const date = formatDate(event.created_at)
    acc[date] = (acc[date] || 0) + getValue(event)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Fills missing dates in a timeline with zero values
 * Ensures proper date handling and sorting
 */
export function fillTimelineGaps(
  timeline: { date: string, count: number }[],
  days: number,
): { date: string, count: number }[] {
  const { start, end } = getDateRange(days)
  const result: { date: string, count: number }[] = []

  const dateMap = new Map(timeline.map(item => [item.date, item.count]))
  let current = new Date(start)

  while (current <= end) {
    const dateStr = formatDate(current)
    result.push({
      date: dateStr,
      count: dateMap.get(dateStr) || 0,
    })
    current = new Date(current.setDate(current.getDate() + 1))
  }

  return result
}
