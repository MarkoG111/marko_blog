import { api } from "./api";

export const deleteComment = (commentId, isPersonal) =>
    api.delete(`/comments/${commentId}${isPersonal ? "/personal" : ""}`);

export const getComment = (id) =>
    api.get(`/comments/${id}`);

export const getParentComment = (idParent) =>
    api.get(`/comments/${idParent}`);

export const getCommentsPaged = (page) =>
    api.get(`/comments?page=${page}`);

export const createComment = (data) =>
    api.post(`/comments`, data);

export const createChildComment = (data) =>
    api.post(`/comments`, data);

export const updateComment = (idComment, newText) =>
    api.put(`/comments/${idComment}`, { commentText: newText });

export const deleteCommentAdmin = (idComment) =>
    api.delete(`/comments/${idComment}`);

export const deleteCommentPersonal = (idComment) =>
    api.delete(`/comments/${idComment}/personal`);
