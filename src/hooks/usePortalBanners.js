import { useCallback, useMemo, useState } from "react";
import {
  createPortalBanner,
  deletePortalBanner,
  getActivePortalBanner,
  listPortalBanners,
  listActivePortalBanners,
  updatePortalBannerStatus,
  updatePortalBanner,
} from "../services/portal-banners.service";

export function usePortalBanners() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(async (operation) => {
    setLoading(true);
    setError("");
    try {
      return await operation();
    } catch (reason) {
      setError(reason.message);
      throw reason;
    } finally {
      setLoading(false);
    }
  }, []);

  const list = useCallback(() => run(listPortalBanners), [run]);
  const listActive = useCallback(() => run(listActivePortalBanners), [run]);
  const getActive = useCallback(() => run(getActivePortalBanner), [run]);
  const create = useCallback((payload) => run(() => createPortalBanner(payload)), [run]);
  const update = useCallback((id, payload) => run(() => updatePortalBanner(id, payload)), [run]);
  const setStatus = useCallback((id, isActive) => run(() => updatePortalBannerStatus(id, isActive)), [run]);
  const remove = useCallback((id) => run(() => deletePortalBanner(id)), [run]);

  return useMemo(
    () => ({ loading, error, list, listActive, getActive, create, update, setStatus, remove }),
    [loading, error, list, listActive, getActive, create, update, setStatus, remove],
  );
}
