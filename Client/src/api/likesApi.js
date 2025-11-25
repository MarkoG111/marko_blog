import { api } from "./api";

export const voteComment = (idComment, data) =>
    api.post(`/likes/comments/${idComment}`, data);

export const removeVote = (idComment) =>
    api.delete(`/likes/comments/${idComment}`);

export const addPostLike = (idPost, payload) =>
    api.post(`/likes/posts/${idPost}`, payload)

export const removePostLike = (idPost) =>
    api.delete(`/likes/posts/${idPost}`)