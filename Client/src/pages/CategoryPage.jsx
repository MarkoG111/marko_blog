import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Pagination } from "flowbite-react"
import { useError } from "../contexts/ErrorContext"
import { getCategoryById } from "../api/categoriesApi"
import { Link } from 'react-router-dom';

export default function CategoryPage() {
  const { id } = useParams()

  const [category, setCategory] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  const { showError } = useError()

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(id, currentPage)

        setCategory(data)
        setPageCount(data.pageCount)
      } catch (error) {
        showError(error.message)
      }
    }

    fetchCategory()
  }, [id, currentPage, showError])

  const onPageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageCount) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <main className="max-w-6xl mx-auto min-h-screen p-3">
      <header className="dark:bg-gray-800 border border-teal-500 rounded-lg text-center mt-12">
        <h1 className="text-3xl p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">{category && category.categoryName}</h1>
      </header>

      {category && category.items && category.items.length > 0 ? (
        <div className="dark:bg-gray-800 border border-teal-500 rounded-lg  my-12 w-full px-8 pb-8">
          <div className="flex flex-wrap">
            {category.items.map((post) => (
              <div key={post.id} className="dark:bg-gray-800 border border-teal-500 rounded-lg mt-12 w-full pb-8 mr-auto">
                <div className="flex pt-4 pl-2">
                  <div>
                    <img src={post && post.profilePicture.startsWith('http') ? post.profilePicture : `../api/images/profile-image/${post.profilePicture}`} alt='profilePicture' className='w-10 object-cover rounded-full' />
                  </div>
                  <div className="flex flex-col pl-4">
                    <div className="text-sm">{post && post.firstName + " " + post.lastName}</div>
                    <div className="text-sm">{new Date(post && post.dateCreated).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex py-6 pl-16">
                  <Link
                    to={`/post/${post.id}`}
                    className="hover:underline hover:text-teal-500 dark:hover:text-teal-300 transition duration-200 ease-in-out"
                  >
                    <h4 className="text-2xl">{post.title}</h4>
                  </Link>
                </div>
                <div className="text-left pl-16">
                  <ul className="flex flex-wrap gap-y-6 gap-x-5">
                    {post && post.categories.map((category) => (
                      <li key={category.id} className="text-sm">
                        <Link
                          to={`/category/${category.id}`}
                          className="rounded p-2 dark:bg-gray-700 bg-gray-100 hover:underline hover:text-teal-500 dark:hover:text-teal-300 transition duration-200 ease-in-out"
                        >
                          #{category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center my-12">
            <Pagination
              currentPage={currentPage}
              onPageChange={onPageChange}
              totalPages={pageCount}
              className="text-l"
            />
          </div>
        </div>
      ) :
        (<h1 className="text-center text-3xl mt-16">No Posts.</h1>)}
    </main>
  )
}
