import { Button, Spinner } from "flowbite-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import CommentSection from "../components/CommentSection"
import PostLikeButtons from "../components/PostLikeButtons"
import { useSelector } from "react-redux"
import { useError } from "../contexts/ErrorContext"
import { handleApiError } from "../utils/handleApiUtils"
import { useNavigate } from 'react-router-dom'

import {
  removeDislikeOrLikeIfPresentInPost,
  checkIfAlreadyVotedOnPost,
  updatePostLikes

} from '../utils/postLikeUtils'

export default function PostPage() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState(null)
  const [commentsNumber, setCommentsNumber] = useState(0)

  const { showError } = useError()

  const navigate = useNavigate()

  const { currentUser } = useSelector(state => state.user)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)

        const response = await fetch(`/api/posts/${id}`, {
          method: "GET"
        })

        if (response.ok) {
          const data = await response.json()

          setPost(data)
          setLoading(false)
        } else {
          await handleApiError(response, showError)
        }
      } catch (error) {
        showError("An unexpected error occurred while loading the post.")
      }
    }

    fetchPost()
  }, [id, showError])

  const handlePostVote = async (idPost, status) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        showError("You must be logged in to vote.")
        navigate("/sign-in")
        return
      }

      const isAlreadyVoted = checkIfAlreadyVotedOnPost(post, idPost, currentUser.id, status)

      if (isAlreadyVoted) {
        const response = await fetch(`/api/likes/posts/${idPost}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const updatedPost = removeDislikeOrLikeIfPresentInPost(post, idPost, currentUser.id, status)
          setPost(updatedPost)
        } else {
          await handleApiError(response, showError)
        }

        return
      }

      const body = JSON.stringify({
        IdUser: currentUser.id,
        IdPost: idPost,
        Status: status,
      })

      const response = await fetch(`/api/likes/posts/${idPost}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      })

      if (response.ok) {
        const data = await response.json()
        const updatedPost = updatePostLikes(post, idPost, data, currentUser.id)
        setPost(updatedPost)
      } else {
        await handleApiError(response, showError)
      }
    } catch (error) {
      showError("An error occurred while processing your request.")
    }
  }

  const handleCommentsNumberChange = (newCount) => {
    setCommentsNumber(newCount)
  }

  if (loading) return (
    <div className="flex flex-col justify-center text-center min-h-screen">
      <Spinner size="xl" />
    </div>
  )

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen bg-slate-100 dark:bg-gray-800 my-12 rounded-2xl">
      <h1 className="text-3xl mt-2 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">{post && post.title}</h1>

      <div className="flex justify-center flex-wrap">
        {post && post.categories.map((category) => (
          <Link to={`/category/${category.id}`} className="self-center mt-5 ml-6" key={category.id}>
            <Button color="gray" className="p-3" pill size="s">{category.name}</Button>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <p className="text-xl">Author: {post.username}</p>
      </div>

      <img src={post && `/api/images/${post.imageName}`} alt={post && post.title} className="mt-10 p-3 max-h-[300px] w-full object-contain" />

      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl">
        <span>{post && new Date(post.dateCreated).toLocaleDateString()}</span>
        <span className="italic">{post && (post.content.length / 1000).toFixed(0)} mins read</span>
      </div>

      <div className="p-3 max-w-2xl mx-auto w-full post-content" dangerouslySetInnerHTML={{ __html: post && post.content }}>

      </div>

      <div className="px-4 max-w-2xl mx-auto w-full">
        <PostLikeButtons
          post={post}
          idPost={post.id}
          onPostVote={handlePostVote}
          commentsNumber={commentsNumber}
        />
      </div>

      <CommentSection idPost={post.id} childrenComments={post.comments.filter(comment => comment.childrenComments.length > 0).flatMap(comment => comment.children)} onCommentsNumberChange={handleCommentsNumberChange} />
    </main>
  )
}