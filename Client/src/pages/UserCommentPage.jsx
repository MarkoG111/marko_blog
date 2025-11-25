import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button, Spinner } from "flowbite-react"
import { AiOutlineHeart } from "react-icons/ai"
import { useError } from "../contexts/ErrorContext"

import { getComment, getParentComment } from "../api/commentsApi"

export default function UserCommentPage() {
  const { id } = useParams()

  const [comment, setComment] = useState(null)
  const [parentComment, setParentComment] = useState(null)
  const [loading, setLoading] = useState(true)

  const { showError } = useError()

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        const data = await getComment(id)
        setComment(data)

        if (data.idParent) {
          try {
            const parent = await getParentComment(data.idParent)
            setParentComment(parent)
          } catch {
            setParentComment(null)
          }
        }
      } catch (err) {
        showError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    )

  if (!comment)
    return (
      <main className="flex flex-col max-w-3xl mx-auto my-12 p-6 text-center">
        <h2 className="text-2xl text-gray-600">Comment not found</h2>
      </main>
    )


  return (
    <main className="flex flex-col max-w-3xl mx-auto my-12 rounded-2xl bg-slate-100 p-6 dark:bg-gray-800">
      <p className="text-xl mb-3 text-gray-600 dark:text-gray-300">
        Discussion on:
        <span className="text-3xl text-gray-900 dark:text-white">
          {" "}
          {comment.postTitle}
        </span>
      </p>

      <Button gradientDuoTone="purpleToPink">
        <Link to={`/post/${comment.idPost}`}>View post</Link>
      </Button>

      {parentComment && (
        <div className="border-t-2 border-red-400 mt-6 pt-4">
          <p className="text-gray-500 dark:text-gray-300">
            Reply to:
            <Link
              to={`/comment/${parentComment.id}`}
              className="text-black dark:text-white ml-1 underline"
            >
              {parentComment.commentText}
            </Link>
          </p>
        </div>
      )}

      <div className="border-t-2 border-red-400 mt-6 pt-4">
        <div className="border-2 border-red-400 p-4 rounded-md">
          <div className="flex gap-2 text-gray-700 dark:text-gray-200">
            <p>
              {comment.firstName} {comment.lastName}
            </p>
            <span>•</span>
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="pt-3 dark:text-gray-100">{comment.commentText}</p>
        </div>
      </div>

      <div className="flex gap-2 px-1 pt-3 text-gray-700 dark:text-gray-200">
        <AiOutlineHeart size="22" />
        <p>
          {comment.likesCount} like
          {comment.likesCount !== 1 ? "s" : ""}
        </p>
      </div>
    </main>
  )
}
