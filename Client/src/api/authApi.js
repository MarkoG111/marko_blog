import { api } from "./api"

export const googleSignIn = (payload) =>
    api.post(`/auth`, payload, { skipAuth: true })

export const loginUser = (payload) =>
    api.post(`/login`, payload, { skipAuth: true })

export const registerUser = (payload) =>
    api.post(`/register`, payload, { skipAuth: true })