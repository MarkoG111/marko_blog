import { Select, TextInput, Pagination } from "flowbite-react"
import { useEffect, useState } from "react"
import PostCard from "../components/PostCard"
import MultiSelectDropdown from "../components/MultiSelectDropdown"
import { useLocation } from "react-router-dom"
import { useError } from "../contexts/ErrorContext"
import { getPostsPaged } from "../api/postsApi"
import { getAllPublicCategories } from "../api/categoriesApi"

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
    const params = new URLSearchParams(location.search)
    const search = params.get("search") || ''
    setSearchTerm(search)
    setCurrentPage(1)
  }, [location.search])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage,
          perPage: 5,
          title: searchTerm,
          sortOrder
        })

        selectedCategories.forEach((id, i) => {
          params.append(`categoryIds[${i}]`, id)
        })

        const data = await getPostsPaged(params.toString())
        setPosts(data.items)
        setPageCount(data.pageCount)
      } catch (error) {
        showError(error.message)
      }
    }

    loadPosts()
  }, [currentPage, searchTerm, sortOrder, selectedCategories])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllPublicCategories()
        setCategories(data.items)
      } catch (error) {
        showError(error.message)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500 md:w-2/6">
        <form className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <label className="font-semibold">Search:</label>
            <TextInput
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>

          <div>
            <label className="font-semibold">Categories:</label>
            <MultiSelectDropdown formFieldName="categoryIds" categories={categories} onChange={setSelectedCategories} />
          </div>
        </form>
      </div>

      {/* Posts */}
      <div className="w-full">
        <h1 className="text-3xl font-semibold border-b border-gray-500 p-3">Posts</h1>

        <div className="p-7 flex flex-wrap gap-4">
          {posts.length === 0 && <p className="text-xl text-gray-500">No posts found.</p>}
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>

        {posts.length > 0 && (
          <div className="px-8 pb-12">
            <Pagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={pageCount}
            />
          </div>
        )}
      </div>
    </div>
  )
}
