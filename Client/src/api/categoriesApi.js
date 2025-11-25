import { api } from "./api"

export const updateCategory = (id, name) =>
  api.put(`/categories/${id}`, { name })

export const deleteCategory = (id) =>
  api.delete(`/categories/${id}`)

export const getCategoryById = (id, page = 1, perPage = 3) =>
  api.get(`/categories/${id}?page=${page}&perPage=${perPage}`, {
    skipAuth: true
  })

export const getCategoriesPaged = (page = 1, perPage = 12) =>
  api.get(`/categories?page=${page}&perPage=${perPage}`);

export const getAllCategoriesAuth = () =>
  api.get(`/categories?getAll=true`)

export const createCategory = (payload) =>
  api.post(`/categories`, payload)

export const getAllPublicCategories = () =>
  api.get(`/categories?getAll=true`, { skipAuth: true })
