import { useCallback, useMemo, useState } from 'react'
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent,
  getCalendarEventAudit,
  listCalendarEvents,
  listCalendarMonthMarkers,
  updateCalendarEvent,
} from '../services/calendar-events.service'

export function useCalendarEvents() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (operation) => {
    setLoading(true)
    setError('')
    try {
      return await operation()
    } catch (reason) {
      setError(reason.message)
      throw reason
    } finally {
      setLoading(false)
    }
  }, [])

  const list = useCallback((params) => run(() => listCalendarEvents(params)), [run])
  const get = useCallback((id) => run(() => getCalendarEvent(id)), [run])
  const audit = useCallback((id) => run(() => getCalendarEventAudit(id)), [run])
  const listMonthMarkers = useCallback(
    (params) => run(() => listCalendarMonthMarkers(params)),
    [run],
  )
  const create = useCallback((payload) => run(() => createCalendarEvent(payload)), [run])
  const update = useCallback((id, payload) => run(() => updateCalendarEvent(id, payload)), [run])
  const remove = useCallback((id) => run(() => deleteCalendarEvent(id)), [run])

  return useMemo(
    () => ({ loading, error, list, get, audit, listMonthMarkers, create, update, remove }),
    [loading, error, list, get, audit, listMonthMarkers, create, update, remove],
  )
}
