import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Button, Spinner } from "flowbite-react"
import { HiDocumentText, HiOutlineMail } from "react-icons/hi"
import { FaRegCommentDots, FaUsers } from "react-icons/fa"
import { FaUserPlus } from "react-icons/fa6"
import { RiUserFollowLine, RiUserUnfollowFill } from "react-icons/ri"
import { useSelector } from "react-redux"

import { useError } from "../contexts/ErrorContext"
import { getUserById } from "../api/usersApi"
import { checkIfFollowing, followUser, unfollowUser } from "../api/followersApi"
import { getAvatarSrc } from "../utils/getAvatarSrc"

export default function UserPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  const { currentUser } = useSelector((state) => state.user)
  const { showError } = useError()

  const isCurrentUser = currentUser && currentUser.id === Number(id)

  // Load user + follow status
  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        const userData = await getUserById(id)
        setUser(userData)

        // check follow only if logged in
        if (currentUser) {
          try {
            const followStatus = await checkIfFollowing(id)
            setIsFollowing(followStatus.isFollowing)
          } catch {
            setIsFollowing(false)
          }
        }
      } catch (err) {
        showError("Failed to load user.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  // Follow user
  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/sign-in")
      return
    }

    try {
      await followUser(id)

      setIsFollowing(true)
      setUser((prev) => ({
        ...prev,
        followersCount: prev.followersCount + 1,
      }))
    } catch (err) {
      showError(err.message)
    }
  }

  // Unfollow user
  const handleUnfollow = async () => {
    try {
      await unfollowUser(id)

      setIsFollowing(false)
      setUser((prev) => ({
        ...prev,
        followersCount: prev.followersCount - 1,
      }))
    } catch (err) {
      showError(err.message)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    )

  if (!user)
    return (
      <main className="max-w-6xl mx-auto p-3 mt-20 text-center">
        <h2 className="text-2xl text-gray-500">User not found</h2>
      </main>
    )

  const latestPost = user.userPosts?.[0]
  const otherPosts = user.userPosts?.slice(1) || []

  return (
    <main className="max-w-6xl mx-auto min-h-screen p-3">
      {/* HEADER */}
      <header className="dark:bg-gray-800 border border-teal-500 rounded-lg text-center mt-12 p-6">
        <img
          src={getAvatarSrc(user.profilePicture)}
          alt="profile"
          className="rounded-full w-[90px] h-[90px] mx-auto"
          referrerPolicy="no-referrer"
        />

        <h1 className="text-3xl p-3 font-serif">
          {user.firstName} {user.lastName}
        </h1>

        <div className="flex justify-center gap-6 text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <FaUsers /> {user.followersCount}{" "}
            {user.followersCount === 1 ? "follower" : "followers"}
          </span>

          <span className="flex items-center gap-1">
            <RiUserFollowLine /> {user.followingCount} following
          </span>
        </div>

        {!isCurrentUser && (
          <div className="mt-6">
            {isFollowing ? (
              <Button gradientDuoTone="purpleToPink" onClick={handleUnfollow}>
                <RiUserUnfollowFill className="mr-2" /> Unfollow
              </Button>
            ) : (
              <Button gradientDuoTone="purpleToPink" onClick={handleFollow}>
                <FaUserPlus className="mr-2" /> Follow
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-center gap-3 mt-10 text-lg">
          <HiOutlineMail /> {user.email}
        </div>

        <div className="flex flex-col items-center mt-6 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <HiDocumentText /> {user.userPosts.length}{" "}
            {user.userPosts.length === 1 ? "post" : "posts"}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <FaRegCommentDots /> {user.userComments.length}{" "}
            {user.userComments.length === 1 ? "comment" : "comments"}
          </div>
        </div>
      </header>

      {/* POSTS */}
      <section className="mt-12">
        <div className="flex flex-wrap gap-10">
          {latestPost && (
            <div className="dark:bg-gray-800 border border-teal-500 rounded-lg p-6 w-full md:w-2/5">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarSrc(user.profilePicture)}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p>{user.firstName} {user.lastName}</p>
                  <p>{new Date(latestPost.dateCreated).toLocaleDateString()}</p>
                </div>
              </div>

              <Link
                to={`/post/${latestPost.id}`}
                className="block mt-4 hover:text-teal-400"
              >
                <h3 className="text-xl">{latestPost.title}</h3>
              </Link>

              <ul className="flex flex-wrap gap-2 mt-4">
                {latestPost.categories.map((c) => (
                  <li key={c.id} className="text-sm">
                    <Link to={`/category/${c.id}`} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      #{c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* RECENT COMMENTS */}
          {user.userComments.length > 0 && (
            <div className="dark:bg-gray-800 border border-teal-500 rounded-lg p-6 w-full md:w-1/2">
              <h3 className="text-2xl font-bold mb-4">Recent comments</h3>

              {user.userComments.slice(0, 2).map((comment, index) => (
                <Link key={comment.id} to={`/comment/${comment.id}`}>
                  <div className="hover:bg-slate-100 dark:hover:bg-slate-700 p-4 rounded">
                    <h4 className="text-lg">{comment.postTitle}</h4>
                    <p className="text-sm text-gray-400">{comment.commentText}</p>
                    <span className="text-sm">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {index === 0 && <hr className="my-4 border-teal-300" />}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* OTHER POSTS */}
        {otherPosts.length > 0 && (
          <div className="dark:bg-gray-800 border border-teal-500 rounded-lg p-6 mt-12">
            {otherPosts.map((post) => (
              <div
                key={post.id}
                className="border-b py-6 last:border-none"
              >
                <Link to={`/post/${post.id}`} className="hover:text-teal-400">
                  <h3 className="text-xl">{post.title}</h3>
                </Link>
                <span className="text-sm text-gray-500 block mt-1">
                  {new Date(post.dateCreated).toLocaleDateString()}
                </span>

                <ul className="flex flex-wrap gap-2 mt-3">
                  {post.categories.map((c) => (
                    <li key={c.id} className="text-sm">
                      <Link to={`/category/${c.id}`} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        #{c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
