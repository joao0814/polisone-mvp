import { useCallback, useMemo, useState } from 'react'
import { archiveCommunication, createCommunication, deleteCommunication, getCommunication, listAdminCommunications, listCommunicationCategories, listCommunications, publishCommunication, restoreCommunication, updateCommunication } from '../services/communications.service'
export function useCommunications() {
  const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const run = useCallback(async (operation) => { setLoading(true); setError(''); try { return await operation() } catch (reason) { setError(reason.message); throw reason } finally { setLoading(false) } }, [])
  const list = useCallback((params) => run(() => listCommunications(params)), [run]); const get = useCallback((slug) => run(() => getCommunication(slug)), [run]); const categories = useCallback(() => run(listCommunicationCategories), [run]); const create = useCallback((payload) => run(() => createCommunication(payload)), [run]); const publish = useCallback((id) => run(() => publishCommunication(id)), [run])
  const listAdmin = useCallback((params) => run(() => listAdminCommunications(params)), [run]); const update = useCallback((id, payload) => run(() => updateCommunication(id, payload)), [run]); const archive = useCallback((id) => run(() => archiveCommunication(id)), [run]); const restore = useCallback((id) => run(() => restoreCommunication(id)), [run]); const remove = useCallback((id) => run(() => deleteCommunication(id)), [run])
  return useMemo(() => ({ loading, error, list, get, categories, create, publish, listAdmin, update, archive, restore, remove }), [loading, error, list, get, categories, create, publish, listAdmin, update, archive, restore, remove])
}
