import { Select, TextInput, Pagination } from "flowbite-react"
import { useEffect, useState } from "react"
import PostCard from "../components/PostCard"
import MultiSelectDropdown from "../components/MultiSelectDropdown"
import { useLocation } from "react-router-dom"
import { useError } from "../contexts/ErrorContext"
import { handleApiError } from "../utils/handleApiUtils"

export default function PostsPage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  const { showError } = useError()

  const location = useLocation()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const search = queryParams.get('search') || ''

    setSearchTerm(search)
    setCurrentPage(1)
  }, [location.search])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          perPage: 5,
          title: searchTerm,
          sortOrder: sortOrder,
        })

        if (selectedCategories.length > 0) {
          selectedCategories.forEach((idCategory, index) => {
            queryParams.append(`categoryIds[${index}]`, idCategory)
          })
        }

        const response = await fetch(`/api/posts?${queryParams}`, {
          method: "GET"
        })

        if (response.ok) {
          const data = await response.json()

          setPosts(data.items)
          setPageCount(data.pageCount)
        } else {
          await handleApiError(response, showError)
        }
      } catch (error) {
        showError(error.message)
      }
    }

    fetchPosts()
  }, [currentPage, searchTerm, sortOrder, selectedCategories])

  useEffect(() => {
    const fetchPostCategories = async () => {
      try {
        const response = await fetch(`/api/categories?getAll=true`, {
          method: "GET"
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

    fetchPostCategories()
  }, [])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleSortChange = (e) => {
    setSortOrder(e.target.value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (selectedCategories) => {
    setSelectedCategories(selectedCategories)
    setCurrentPage(1)
  }

  const onPageChange = (page) => {
    if (page > 0 && page <= pageCount) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500 sm:w-full md:w-2/6">
        <form className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Search Term:</label>
            <TextInput placeholder="Search..." id="searchTerm" type="text" onChange={handleSearchChange} className="w-1/2" value={searchTerm} />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <Select id="sort" onChange={handleSortChange} className="w-1/3" value={sortOrder}>
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Categories:</label>
              <div className="relative w-full ">
                <MultiSelectDropdown formFieldName={"categories"} categories={categories} onChange={handleCategoryChange} prompt="Select one or more categories" />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="w-full">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">Posts</h1>
        <div className="p-7 flex flex-wrap gap-4">
          {posts.length == 0 && (
            <p className="text-xl text-gray-500">No posts found.</p>
          )}
          {
            posts.length > 0 && posts.map((post) =>
              <PostCard key={post.id} post={post} />
            )
          }
        </div>

        <div className="px-8 pb-12">
          {posts.length > 0 &&
            <Pagination
              currentPage={currentPage}
              onPageChange={onPageChange}
              totalPages={pageCount}
              className="text-l"
            />
          }
        </div>
      </div>
    </div>
  )
}
