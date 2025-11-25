import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"
import { signoutSuccess } from '../redux/user/userSlice'
import { Sidebar, Button } from 'flowbite-react'
import { HiUser, HiArrowSmRight, HiDocumentText, HiOutlineUserGroup, HiOutlineUserAdd } from 'react-icons/hi'
import { RiPieChart2Fill } from "react-icons/ri"
import { FaFolder, FaRegComments } from "react-icons/fa"
import { useError } from '../contexts/ErrorContext'
import { BsListColumns } from "react-icons/bs"
import { getUserById } from "../api/usersApi"

export default function DashSidebar() {
  const location = useLocation()

  const [tab, setTab] = useState('')
  const [user, setUser] = useState('')

  const dispatch = useDispatch()

  const { currentUser } = useSelector(state => state.user)

  const { showError } = useError()

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get('tab')

    if (tabFromUrl) {
      setTab(tabFromUrl)
    }
  }, [location.search])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(currentUser.id)
        setUser(data)
      } catch (error) {
        showError(error.message)
      }
    }

    fetchUser()
  }, [currentUser.id, showError])

  const handleSignout = async () => {
    try {
      localStorage.removeItem("token")
      dispatch(signoutSuccess())
    } catch (error) {
      showError(error.message)
    }
  }

  const getRoleLabel = () => {
    if (currentUser.roleName === 'Admin') {
      return 'Admin'
    } else if (currentUser.roleName === 'Author') {
      return 'Author'
    } else {
      return 'User'
    }
  }

  return (
    <Sidebar className='w-full md:w-56'>
      <Sidebar.Items>
        <Sidebar.ItemGroup className='flex flex-col gap-1'>

          {currentUser.roleName === 'Admin' && (
            <Link to='/dashboard?tab=dashboard'>
              <Sidebar.Item active={tab == 'dashboard'} icon={RiPieChart2Fill} labelColor='dark' as='div'>
                Dashboard
              </Sidebar.Item>
            </Link>
          )}

          <Link to='/dashboard?tab=profile'>
            <Sidebar.Item active={tab == 'profile'} icon={HiUser} label={getRoleLabel()} labelColor='dark' as='div'>
              Profile
            </Sidebar.Item>
          </Link>

          {currentUser.roleName === 'User' && (
            <Link to='/dashboard?tab=requestAuthorForm'>
              <Button type="button" gradientDuoTone='purpleToPink' className="w-full">Request to Become an Author</Button>
            </Link>
          )}

          {currentUser.roleName === 'Author' && (
            <Link to='/dashboard?tab=userPosts'>
              <Sidebar.Item active={tab === 'userPosts'} as='div'>
                <div className='flex justify-between'>
                  <span>My Posts</span>
                  <span className="w-8 h-7 pt-1 text-center rounded-full dark:bg-cyan-600 bg-gray-600 text-white text-sm font-bold">{user.postsCount}</span>
                </div>
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Author' && (
            <Link to={'/dashboard?tab=followers'}>
              <Sidebar.Item active={tab === 'followers'} as='div'>
                <div className='flex justify-between'>
                  <span>Followers</span>
                  <span className="w-8 h-7 pt-1 text-center rounded-full dark:bg-cyan-600 bg-gray-600 text-white text-sm font-bold">{user.followersCount}</span>
                </div>
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Author' && (
            <Link to={'/dashboard?tab=following'}>
              <Sidebar.Item active={tab === 'following'} as='div'>
                <div className='flex justify-between'>
                  <span>Following</span>
                  <span className="w-8 h-7 pt-1 text-center rounded-full dark:bg-cyan-600 bg-gray-600 text-white text-sm font-bold">{user.followingCount}</span>
                </div>
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Admin' && (
            <Link to='/dashboard?tab=comments'>
              <Sidebar.Item active={tab === 'comments'} icon={FaRegComments} as='div'>
                Comments
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Admin' && (
            <Link to='/dashboard?tab=users'>
              <Sidebar.Item active={tab === 'users'} icon={HiOutlineUserGroup} as='div'>
                Users
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Admin' && (
            <Link to='/dashboard?tab=posts'>
              <Sidebar.Item active={tab === 'posts'} icon={HiDocumentText} as='div'>
                Posts
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Admin' && (
            <Link to='/dashboard?tab=categories'>
              <Sidebar.Item active={tab === 'categories'} icon={FaFolder} as='div'>
                Categories
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Admin' && (
            <Link to='/dashboard?tab=useCaseLogs'>
              <Sidebar.Item active={tab === 'useCaseLogs'} icon={BsListColumns} as='div'>
                Logs
              </Sidebar.Item>
            </Link>
          )}

          {currentUser.roleName === 'Admin' && (
            <Link to='/dashboard?tab=authorRequests'>
              <Sidebar.Item active={tab === 'authorRequests'} icon={HiOutlineUserAdd} as='div'>
                Author Requests
              </Sidebar.Item>
            </Link>
          )}

          <Sidebar.Item icon={HiArrowSmRight} className='cursor-pointer' onClick={handleSignout}>
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  )
}
