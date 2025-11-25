import { api, apiClient } from "./api";

export const getUsersPaged = (page, perPage = 12) =>
    api.get(`/users?page=${page}&perPage=${perPage}`)

export const getAuthorsPaged = (page, perPage = 12) =>
    api.get(`/users?onlyAuthors=true&page=${page}&perPage=${perPage}`)

export const getUserById = (id) =>
    api.get(`/users/${id}`)

export const updateUser = (id, formData) =>
    apiClient(`/users/${id}`, {
        method: "PUT",
        body: formData
    });

export const deleteUser = (id) =>
    api.delete(`/users/${id}`)