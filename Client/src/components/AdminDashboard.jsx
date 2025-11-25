import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { HiArrowNarrowUp, HiOutlineUserGroup, HiDocumentText } from "react-icons/hi"
import { FaRegComments } from "react-icons/fa"
import { Button, Table } from "flowbite-react"
import { Link } from "react-router-dom"
import { useError } from "../contexts/ErrorContext"
import { getAvatarSrc } from "../utils/getAvatarSrc"

import { getCommentsPaged } from "../api/commentsApi"
import { getUsersPaged } from "../api/usersApi"
import { getPostsPagedAdmin } from "../api/postsApi"

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [posts, setPosts] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalComments, setTotalComments] = useState(0)
  const [totalPosts, setTotalPosts] = useState(0)
  const [lastMonthUsers, setLastMonthUsers] = useState(0)
  const [lastMonthComments, setLastMonthComments] = useState(0)
  const [lastMonthPosts, setLastMonthPosts] = useState(0)

  const { currentUser } = useSelector((state) => state.user)

  const { showError } = useError()

  const API_BASE = "https://marko-blog-bfdqeaf7dqacb3e7.westeurope-01.azurewebsites.net";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("Token not found")
        }

        const [usersData, commentsData, postsData] = await Promise.all([
          getUsersPaged(1, 5),
          getCommentsPaged(1,5),
          getPostsPagedAdmin(1,5)
        ])

        setUsers(usersData.items.slice(0, 5))
        setTotalUsers(usersData.totalCount)
        setLastMonthUsers(usersData.lastMonthCount)

        setComments(commentsData.items.slice(0, 5))
        setTotalComments(commentsData.totalCount)
        setLastMonthComments(commentsData.lastMonthCount)

        setPosts(postsData.items.slice(0, 5))
        setTotalPosts(postsData.totalCount)
        setLastMonthPosts(postsData.lastMonthCount)
      } catch (error) {
        showError(error.message)
      }
    }

    if (currentUser.roleName === "Admin") {
      fetchDashboardData()
    }
  }, [currentUser.roleName, showError])

  return (
    <div className="p-3 md:mx-auto">
      <div className="flex-wrap flex gap-4 justify-center">
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">Total Users</h3>
              <p className="text-2xl">{totalUsers}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center">
              <HiArrowNarrowUp />
              {lastMonthUsers}
            </span>
            <div className="text-gray-500">Last month</div>
          </div>
        </div>

        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">Total Comments</h3>
              <p className="text-2xl">{totalComments}</p>
            </div>
            <FaRegComments className="bg-indigo-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center">
              <HiArrowNarrowUp />
              {lastMonthComments}
            </span>
            <div className="text-gray-500">Last month</div>
          </div>
        </div>

        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">Total Posts</h3>
              <p className="text-2xl">{totalPosts}</p>
            </div>
            <HiDocumentText className="bg-lime-600 text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-green-500 flex items-center">
              <HiArrowNarrowUp />
              {lastMonthPosts}
            </span>
            <div className="text-gray-500">Last month</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 py-3 mx-auto justify-center">
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className="flex justify-between p-3 text-sm font:semibold">
            <h1 className="text-center p-2">Recent users</h1>
            <Button outline gradientDuoTone='purpleToPink'>
              <Link to={'/dashboard?tab=users'}>See all</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>User image</Table.HeadCell>
              <Table.HeadCell>Username</Table.HeadCell>
            </Table.Head>
            {users && users.map((user) => (
              <Table.Body key={user.id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    <img src={getAvatarSrc(user.profilePicture)} referrerPolicy="no-referrer" alt="user" className="w-10 h-10 rounded-full bg-gray-500" />
                  </Table.Cell>
                  <Table.Cell>{user.username}</Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className="flex justify-between p-3 text-sm font:semibold">
            <h1 className="text-center p-2">Recent comments</h1>
            <Button outline gradientDuoTone='purpleToPink'>
              <Link to={'/dashboard?tab=comments'}>See all</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Comment content</Table.HeadCell>
              <Table.HeadCell>Likes</Table.HeadCell>
            </Table.Head>
            {comments && comments.map((comment) => (
              <Table.Body key={comment.id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="w-full">
                    <p className="line-clamp-2">{comment.commentText}</p>
                  </Table.Cell>
                  <Table.Cell>{comment.likesCount}</Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
        <div className="flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800">
          <div className="flex justify-between p-3 text-sm font:semibold">
            <h1 className="text-center p-2">Recent posts</h1>
            <Button outline gradientDuoTone='purpleToPink'>
              <Link to={'/dashboard?tab=posts'}>See all</Link>
            </Button>
          </div>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
            </Table.Head>
            {posts && posts.map((post) => (
              <Table.Body key={post.id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    <img src={`${API_BASE}/Images/${post.imageName}`} alt={post.title} className="w-16 h-14 rounded-md " />
                  </Table.Cell>
                  <Table.Cell className="">{post.title}</Table.Cell>
                  <Table.Cell className="">
                    {post.categories.map((category, index) => (
                      <span key={category.id}>{category.name} {index !== post.categories.length - 1 && ', '} </span>
                    ))}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
        </div>
      </div>
    </div>
  )
}
