import { api } from "./api"

export const createAuthorRequest = (payload) =>
  api.post(`/authorrequests`, payload)

export const getAuthorRequests = (page = 1) =>
  api.get(`/authorrequests?page=${page}`);

export const acceptAuthorRequest = (id) =>
  api.put(`/authorrequests/accept?id=${id}`, {
    status: 2,
    idRole: 3
  });

export const rejectAuthorRequest = (id) =>
  api.put(`/authorrequests/reject?id=${id}`, {
    status: 3,
    idRole: 2
  });
