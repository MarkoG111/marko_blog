import { api } from "./api"

export const uploadImage = (file) => {
    const formData = new FormData()
    formData.append("Image", file)

    return api.post(`/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
}
