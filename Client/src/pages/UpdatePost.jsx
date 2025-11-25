import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { Button, Checkbox, FileInput, TextInput } from "flowbite-react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

import { useError } from "../contexts/ErrorContext"
import { useSuccess } from "../contexts/SuccessContext"

import { getPostById, updatePost, uploadPostImage } from "../api/postsApi"
import { getAllCategoriesAuth } from "../api/categoriesApi"

export default function UpdatePost() {
  const { currentUser } = useSelector((state) => state.user)
  const { postId } = useParams()

  const [post, setPost] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")

  const { showError } = useError()
  const { showSuccess } = useSuccess()

  useEffect(() => {
    const load = async () => {
      try {
        const postData = await getPostById(postId)
        setPost(postData)

        setTitle(postData.title)
        setContent(postData.content)
        setSelectedCategories(postData.categories.map((c) => c.id))

        const allCats = await getAllCategoriesAuth()
        setCategories(allCats.items)
      } catch (err) {
        showError(err.message)
      }
    }

    load()
  }, [postId])

  const handleCategoryChange = (idCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(idCategory)
        ? prev.filter((id) => id !== idCategory)
        : [...prev, idCategory]
    )
  }

  const handleUploadImage = async () => {
    if (!imageFile) return showError("Select an image first.")

    try {
      const form = new FormData()
      form.append("Image", imageFile)

      const result = await uploadPostImage(form)
      setImagePreview(result)
    } catch (err) {
      showError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) return showError("Title cannot be empty.")

    const payload = {
      Title: title,
      Content: content,
      IdImage: imagePreview?.id || post.idImage,
      CategoryIds: selectedCategories,
    }

    try {
      const isPersonal = currentUser.id === post.idUser
      await updatePost(post.id, payload, isPersonal)

      showSuccess("Post updated successfully")
    } catch (err) {
      showError(err.message)
    }
  }

  if (!post) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update post</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextInput
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="flex flex-wrap gap-x-9 mb-6 gap-y-3">
          <h3 className="font-semibold w-full mt-5">Choose Categories</h3>

          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
              {category.name}
            </label>
          ))}
        </div>

        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 p-3 mb-6 rounded-xl border-dotted flex-wrap">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />

          <Button type="button" gradientDuoTone="purpleToBlue" outline onClick={handleUploadImage}>
            Upload Image
          </Button>

          {imagePreview ? (
            <img
              src={`/api/images/${imagePreview.imagePath}`}
              alt="Uploaded"
              className="max-w-full h-auto mt-3"
            />
          ) : post.imageName ? (
            <img
              src={`/api/images/${post.imageName}`}
              alt="Old"
              className="max-w-full h-auto mt-3"
            />
          ) : null}
        </div>

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          className="h-72 mb-12"
        />

        <Button gradientDuoTone="purpleToPink" type="submit">
          Update Post
        </Button>
      </form>
    </div>
  )
}
