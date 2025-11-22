import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Table, Pagination, Modal, Button } from "flowbite-react"
import { HiOutlineExclamationCircle } from 'react-icons/hi'

import { useError } from "../contexts/ErrorContext"
import { useSuccess } from "../contexts/SuccessContext"

import {
  getCommentsPaged,
  deleteCommentAdmin
} from "../api/commentsApi"

export default function DashComments() {
  const { currentUser } = useSelector((state) => state.user)
  const [comments, setComments] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [idCommentToDelete, setIdCommentToDelete] = useState(null)

  const { showError } = useError()
  const { showSuccess } = useSuccess()

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await getCommentsPaged(currentPage)
        setComments(data.items)
        setPageCount(data.pageCount)
      } catch (err) {
        showError(err.message)
      }
    }

    loadComments()
  }, [currentPage])

  const onPageChange = (page) => setCurrentPage(page)

  const handleDeleteComment = async () => {
    setShowModal(false)

    try {
      await deleteCommentAdmin(idCommentToDelete)
      setComments(prev => prev.filter(c => c.id !== idCommentToDelete))
      showSuccess("Comment deleted successfully")
    } catch (err) {
      showError(err.message)
    }
  }

  return (
    <div className="table-container-scrollbar table-auto overflow-x-scroll md:mx-auto p-3">
      {currentUser.roleName === 'Admin' && comments.length > 0 ? (
        <>
          <Table hoverable className="shadow-md my-8">
            <Table.Head>
              <Table.HeadCell>Date created</Table.HeadCell>
              <Table.HeadCell>Comment</Table.HeadCell>
              <Table.HeadCell>Likes</Table.HeadCell>
              <Table.HeadCell>Post</Table.HeadCell>
              <Table.HeadCell>User</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>

            {comments.map((comment) => (
              <Table.Body key={comment.id} className="divide-y">
                <Table.Row className="bg-white">
                  <Table.Cell>{new Date(comment.createdAt).toLocaleDateString()}</Table.Cell>

                  <Table.Cell>
                    {comment.commentText.length < 35
                      ? comment.commentText
                      : comment.commentText.slice(0, 35) + ' ...'}
                  </Table.Cell>

                  <Table.Cell>{comment.likesCount}</Table.Cell>

                  <Table.Cell>
                    <Link to={`/post/${comment.idPost}`} className='text-blue-600'>
                      {comment.postTitle}
                    </Link>
                  </Table.Cell>

                  <Table.Cell>{comment.username}</Table.Cell>

                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true)
                        setIdCommentToDelete(comment.id)
                      }}
                      className="text-red-600 cursor-pointer hover:underline"
                    >
                      Delete
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>

          <Pagination
            currentPage={currentPage}
            onPageChange={onPageChange}
            totalPages={pageCount}
            className="pb-6"
          />
        </>
      ) : (
        <p>No comments found</p>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 mx-auto mb-4" />

            <h3 className="mb-5 text-lg text-gray-500">
              Are you sure you want to delete this comment?
            </h3>

            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteComment}>
                Yes, delete it
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
