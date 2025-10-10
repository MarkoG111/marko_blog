import { useEffect, useState } from "react"
import { Button, Checkbox, FileInput, TextInput } from "flowbite-react"
import { useError } from "../contexts/ErrorContext"
import { useSuccess } from "../contexts/SuccessContext"
import { handleApiError } from "../utils/handleApiUtils"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

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

  const handleCategoryChange = (IdCategory) => {
    setSelectedCategories(prevCategories => {
      if (prevCategories.includes(IdCategory)) {
        return prevCategories.filter(id => id !== IdCategory)
      } else {
        return [...prevCategories, IdCategory]
      }
    })
  }

  useEffect(() => {
    const fetchCategoriesForCreatePost = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token not found")
        }

        const queryParams = new URLSearchParams({
          getAll: true
        })

        const response = await fetch(`/api/categories?${queryParams}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          
          setCategories(data.items)
        } else {
          await handleApiError(response, showError)
        }
      } catch (error) {
        showError(error.message)
      }
    }

    fetchCategoriesForCreatePost()
  }, [showError])

  const handleUploadImage = async () => {
    if (!imageFile) {
      showError("You must choose image.")
      return
    }

    const formData = new FormData()
    formData.append("Image", imageFile)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token not found")
      }

      const response = await fetch(`/api/images`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const imageUrl = await response.json()
        setImagePreview(imageUrl)
      } else {
        await handleApiError(response, showError)
      }
    } catch (error) {
      showError(error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const postData = {
      Title: e.target.elements.title.value,
      Content: content,
      IdImage: imagePreview?.id,
      CategoryIds: selectedCategories
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token not found")
      }

      const response = await fetch('/api/posts', {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        showSuccess("You have successfully added a post")
  
        setContent('')
        setSelectedCategories([])
        setImageFile(null)
        setImagePreview(null)
        
        e.target.elements.title.value = ''
        e.target.elements.fileInput.value = ''
      } else {
        await handleApiError(response, showError)
      }
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
