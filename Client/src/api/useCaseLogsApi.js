import { api } from "./api";

export const getUseCaseLogs = (params) =>
  api.get(`/usecaselogs?${params}`);
