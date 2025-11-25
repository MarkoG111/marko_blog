import PropTypes from 'prop-types'
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { useError } from "../contexts/ErrorContext"
import { Pagination } from 'flowbite-react'
import { getAvatarSrc } from "../utils/getAvatarSrc"

import { getFollowers, getFollowing } from "../api/followersApi"

export default function FollowList({ isFollowersTab }) {
  const [listUsers, setListUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)

  const { currentUser } = useSelector((state) => state.user)

  const { showError } = useError()

  const onPageChange = (page) => setCurrentPage(page)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = isFollowersTab
          ? await getFollowers(currentUser.id, currentPage)
          : await getFollowing(currentUser.id, currentPage)

        setListUsers(data.items)
        setPageCount(data.pageCount)
      } catch (err) {
        showError(err.message)
      }
    }

    fetchData()
  }, [isFollowersTab, currentPage, currentUser.id])

  return (
    <div className='mx-auto'>
      <h1 className='mb-4 font-bold text-xl text-center my-7'>
        {isFollowersTab ? 'Followers' : 'Following'}
      </h1>

      {listUsers.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-12">
          {listUsers.map((user) => {
            return (
              <div key={user.id} className="flex flex-col flex-2 min-w-[250px] items-center dark:bg-gray-800 border border-teal-500 pt-6 rounded-3xl text-center">
                <Link to={`/user/${user.id}`}>
                  <div className="flex flex-col items-center">
                    <img src={getAvatarSrc(user.profilePicture)} referrerPolicy="no-referrer" alt="profilePicture" className="w-32 object-cover rounded-full" />
                    <div className="py-8">
                      <p className="text-indigo-400 text-xl font-semibold">{user.firstName} {user.lastName}</p>
                      <p className="py-3">@{user.username}</p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <p className='text-center'>No users found.</p>
      )}
      <Pagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        totalPages={pageCount}
        className="py-6 text-center"
      />
    </div>
  )
}


FollowList.propTypes = {
  isFollowersTab: PropTypes.bool.isRequired,
}