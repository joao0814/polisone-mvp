import { apiRequest } from "./api";

export const listPortalBanners = () => apiRequest("/admin/banners");
export const listActivePortalBanners = () => apiRequest("/banners");
export const getActivePortalBanner = () => apiRequest("/banners/active");
export const createPortalBanner = (payload) =>
  apiRequest("/admin/banners", { method: "POST", body: payload });
export const updatePortalBanner = (id, payload) =>
  apiRequest(`/admin/banners/${id}`, { method: "PATCH", body: payload });
export const updatePortalBannerStatus = (id, isActive) =>
  apiRequest(`/admin/banners/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
export const deletePortalBanner = (id) =>
  apiRequest(`/admin/banners/${id}`, { method: "DELETE" });
