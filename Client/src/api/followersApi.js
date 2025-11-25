import { api } from "./api"

export const getFollowers = (userId, page = 1, perPage = 5) =>
  api.get(`/followers/${userId}/followers?idUser=${userId}&page=${page}&perPage=${perPage}`)

export const getFollowing = (userId, page = 1, perPage = 5) =>
  api.get(`/followers/${userId}/following?idUser=${userId}&page=${page}&perPage=${perPage}`)

export const followUser = (id) =>
  api.post(`/followers`, {
    IdFollowing: id,
    FollowedAt: new Date().toISOString()
  })

export const unfollowUser = (id) =>
  api.delete(`/followers/${id}/unfollow`)

export const checkIfFollowing = (id) =>
  api.get(`/followers/${id}/check`)