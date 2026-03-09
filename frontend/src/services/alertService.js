import api from './api';

/**
 * Alerts API calls.
 */

// GET /alerts
export const fetchAlerts = () =>
  api.get('/alerts').then((r) => r.data);

// POST /alerts — create new alert
export const createAlert = (payload) =>
  api.post('/alerts', payload).then((r) => r.data);

// DELETE /alerts/:id
export const deleteAlert = (id) =>
  api.delete(`/alerts/${id}`).then((r) => r.data);

// PATCH /alerts/:id/toggle — enable/disable
export const toggleAlert = (id) =>
  api.patch(`/alerts/${id}/toggle`).then((r) => r.data);

// GET /alerts/notifications — recent triggered notifications
export const fetchNotifications = () =>
  api.get('/alerts/notifications').then((r) => r.data);
