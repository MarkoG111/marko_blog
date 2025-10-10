import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import PostCard from "../components/PostCard"
import CallToAction from "../components/CallToAction"
import { useError } from "../contexts/ErrorContext"
import { handleApiError } from "../utils/handleApiUtils"

export default function Home() {
  const [posts, setPosts] = useState([])

  const { showError } = useError()

  useEffect(() => {
    const fetchHomePagePosts = async () => {
      try {
        const response = await fetch(`/api/posts?perPage=4`, {
          method: "GET"
        })

        if (response.ok) {
          const data = await response.json()
          setPosts(data.items)
        } else {
          await handleApiError(response, showError)
        }
      } catch (error) {
        showError(error.message)
      }
    }

    fetchHomePagePosts()
  }, [])

  return (
    <div>
      <div className="flex flex-col gap-6 md:p-28 p-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold lg:text-6xl">Welcome to my Blog</h1>

        <p className="text-gray-500 text-sm">Here you&apos;ll find articles and tutorials about topics such as web development, software engineering, and programming languages.</p>

        <Link to="/posts" className="text-sm text-teal-500 font-bold hover:underline">View all posts</Link>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <CallToAction />
      </div>

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7">
        {
          posts && posts.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-center">Recent Posts</h2>
              <div className="flex flex-wrap gap-4 mt-5 justify-center">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Link to={'/posts'} className="text-lg text-teal-500 hover:underline text-center">View all posts</Link>
            </div>
          )
        }
      </div>
    </div>
  )
}
