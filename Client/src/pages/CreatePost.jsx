import { useEffect, useState } from "react"
import { Button, Checkbox, FileInput, TextInput } from "flowbite-react"
import { useError } from "../contexts/ErrorContext"
import { useSuccess } from "../contexts/SuccessContext"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import { getAllCategoriesAuth } from "../api/categoriesApi"
import { uploadImage } from "../api/imagesApi"
import { createPost } from "../api/postsApi"

export default function CreatePost() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [categories, setCategories] = useState([])

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [content, setContent] = useState('')

  const { showError } = useError()
  const { showSuccess } = useSuccess()

  const handleContentChange = (value) => {
    setContent(value)
  }

  const handleCategoryChange = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategoriesAuth()
        setCategories(data.items)
      } catch (error) {
        showError(error.message)
      }
    }

    loadCategories()
  }, [showError])

  const handleUploadImage = async () => {
    if (!imageFile) {
      showError("You must choose an image.")
      return
    }

    try {
      const imageData = await uploadImage(imageFile)
      setImagePreview(imageData)
    } catch (error) {
      showError(error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const title = e.target.elements.title.value

    const payload = {
      Title: title,
      Content: content,
      IdImage: imagePreview?.id,
      CategoryIds: selectedCategories
    }

    try {
      await createPost(payload)

      showSuccess("You have successfully added a post")

      setContent('')
      setSelectedCategories([])
      setImageFile(null)
      setImagePreview(null)
      e.target.elements.title.value = ''
      e.target.elements.fileInput.value = ''
    } catch (error) {
      showError(error.message)
    }
  }

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create Post</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput type="text" placeholder="Title" required id="title" className="flex-1" />
        </div>

        <div className="flex flex-wrap gap-x-9 mb-6 gap-y-3">
          <h3 className="font-semibold w-full mt-5">Choose Categories</h3>
          {categories.map((category, index) => (
            <div key={index} className="flex items-center">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
              <label className="ml-2">{category.name}</label>
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3 mb-6 flex-wrap rounded-xl">
          <FileInput type="file" id="fileInput" name="fileInput" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          <Button type="button" gradientDuoTone="purpleToBlue" size="sm" outline onClick={handleUploadImage}>Upload Image</Button>

          {imagePreview && (
            <div>
              <img src={`/api/images/${imagePreview.imagePath}`} alt="Uploaded" className="max-w-full h-auto mb-4" />
            </div>
          )}
        </div>

        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          id="content"
          className="h-72 mb-12"
          value={content}
          onChange={handleContentChange}
          required
        />

        <Button type="submit" gradientDuoTone="purpleToPink" className="mt-4">Publish</Button>
      </form>
    </div>
  )
}
