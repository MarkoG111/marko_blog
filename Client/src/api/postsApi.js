import { api } from "./api"

export const getPostsPaged = (queryString) =>
  api.get(`/posts?${queryString}`);

export const getPostsPagedAdmin = (page = 1, perPage = 12) =>
  api.get(`/posts?page=${page}&perPage=${perPage}`);

export const getPostById = (id) =>
  api.get(`/posts/${id}`)

export const createPost = (formData) =>
  api.post(`/posts`, formData)

export const deletePost = (id) =>
  api.delete(`/posts/${id}`)

export const deletePersonalPost = (id) =>
  api.delete(`/posts/${id}/personal`)

export const getHomePosts = () =>
  api.get(`/posts?perPage=4`)

export const updatePost = (id, payload, personal = false) =>
  api.put(`/posts/${id}${personal ? "/personal" : ""}`, payload)

export const uploadPostImage = (formData) =>
  api.post(`/images`, formData, { isFormData: true })