import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { Button, Textarea, Modal } from 'flowbite-react'
import { useError } from '../contexts/ErrorContext'
import { getAvatarSrc } from "../utils/getAvatarSrc"

import {
  createComment,
  createChildComment,
  deleteCommentAdmin,
  deleteCommentPersonal,
} from "../api/commentsApi"

import { voteComment, removeVote } from "../api/likesApi"
import { api } from "../api/api"
import Comment from './Comment'

export default function CommentSection({ idPost, onCommentsNumberChange }) {
  const { currentUser } = useSelector(state => state.user)
  const { showError } = useError()

  const [post, setPost] = useState({})
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [childComments, setChildComments] = useState([])
  const [commentsNumber, setCommentsNumber] = useState(0)
  const [activeReplyIdComment, setActiveReplyIdComment] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState(null)

  const updateCount = (n) => {
    setCommentsNumber(n)
    onCommentsNumberChange(n)
  }

  // LOAD POST + COMMENTS
  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await api.get(`/posts/${idPost}`)

        const main = [...data.comments]
        const child = main.flatMap(c => c.childrenComments || [])

        main.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        setPost(data)
        setComments(main)
        setChildComments(child)

        updateCount(
          main.filter(c => !c.isDeleted).length +
          child.filter(c => !c.isDeleted).length
        )
      } catch (err) {
        showError(err.message)
      }
    }

    loadPost()
  }, [idPost])

  // CREATE MAIN COMMENT
  const submitComment = async (e) => {
    e.preventDefault()
    if (commentText.length > 200) return

    try {
      const newComment = await createComment({
        CommentText: commentText,
        IdPost: idPost,
        IdUser: currentUser.id,
        Username: currentUser.username
      })

      setComments([newComment, ...comments])
      setCommentText('')
      updateCount(commentsNumber + 1)

    } catch (err) {
      showError(err.message)
    }
  }

  // CREATE CHILD COMMENT
  const addChild = async (e, parentId, text) => {
    e.preventDefault()

    try {
      const newChild = await createChildComment({
        IdPost: idPost,
        CommentText: text,
        IdParent: parentId,
        IdUser: currentUser.id,
        Username: currentUser.username
      })

      setChildComments([newChild, ...childComments])
      setActiveReplyIdComment(null)
      updateCount(commentsNumber + 1)

    } catch (err) {
      showError(err.message)
    }
  }

  // VOTING
  const vote = async (idComment, type) => {
    try {
      const comment = comments.find(c => c.id === idComment)
        || childComments.find(c => c.id === idComment)

      const existing = comment.likes.find(l => l.idUser === currentUser.id)

      if (existing && existing.status === type) {
        await removeVote(idComment)
        removeVoteLocal(idComment)
        return
      }

      const newVote = await voteComment(idComment, {
        IdUser: currentUser.id,
        IdPost: idPost,
        IdComment: idComment,
        Status: type
      })

      updateVoteLocal(idComment, newVote)

    } catch (err) {
      showError(err.message)
    }
  }

  const removeVoteLocal = (idComment) => {
    setComments(c => c.map(cm => cm.id === idComment
      ? { ...cm, likes: cm.likes.filter(l => l.idUser !== currentUser.id) }
      : cm
    ))

    setChildComments(c => c.map(cm => cm.id === idComment
      ? { ...cm, likes: cm.likes.filter(l => l.idUser !== currentUser.id) }
      : cm
    ))
  }

  const updateVoteLocal = (idComment, vote) => {
    setComments(c => c.map(cm => cm.id === idComment
      ? { ...cm, likes: [...cm.likes.filter(l => l.idUser !== currentUser.id), vote] }
      : cm
    ))

    setChildComments(c => c.map(cm => cm.id === idComment
      ? { ...cm, likes: [...cm.likes.filter(l => l.idUser !== currentUser.id), vote] }
      : cm
    ))
  }

  // DELETE COMMENT
  const confirmDelete = async () => {
    setShowModal(false)

    try {
      if (currentUser.id === commentToDelete.idUser) {
        await deleteCommentPersonal(commentToDelete.id)
      } else {
        await deleteCommentAdmin(commentToDelete.id)
      }

      setComments(c => c.map(cm =>
        cm.id === commentToDelete.id ? { ...cm, isDeleted: 1 } : cm
      ))

      setChildComments(c => c.map(cm =>
        cm.id === commentToDelete.id ? { ...cm, isDeleted: 1 } : cm
      ))

      updateCount(commentsNumber - 1)

    } catch (err) {
      showError(err.message)
    }
  }

  // RENDER
  return (
    <div className='max-w-2xl mx-auto w-full p-3'>
      {currentUser ? (
        <div className='flex items-center gap-1 my-5 text-gray-500 text-sm'>
          <p>Signed in as:</p>
          <img src={getAvatarSrc(currentUser.profilePicture)} referrerPolicy="no-referrer" className='w-10 rounded-full' />
          <Link to='/dashboard?tab=profile' className='text-cyan-600 hover:underline'>
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className='my-5 text-teal-500 flex gap-1'>
          You must be signed in to comment.
          <Link to='/sign-in' className='text-blue-500 hover:underline'>Sign In</Link>
        </div>
      )}

      {currentUser && (
        <form className='border border-teal-500 rounded-md p-3' onSubmit={submitComment}>
          <Textarea
            placeholder='Leave a comment...'
            rows='3'
            maxLength='200'
            onChange={(e) => setCommentText(e.target.value)}
            value={commentText}
          />
          <div className='flex justify-between items-center mt-5'>
            <p className='text-sm text-gray-500'>{200 - commentText.length} characters remaining</p>
            <Button outline gradientDuoTone='purpleToBlue' type='submit'>Submit</Button>
          </div>
        </form>
      )}

      {comments.length === 0 ? (
        <p className="my-5 text-sm">No comments yet!</p>
      ) : (
        comments.map(c => (
          <Comment
            key={c.id}
            comment={c}
            onLikeComment={(id) => vote(id, 1)}
            onDislikeComment={(id) => vote(id, 2)}
            onAddChildComment={addChild}
            childrenComments={childComments}
            onEditComment={(comment, text) => {
              setComments(cs => cs.map(cm => cm.id === comment.id ? { ...cm, commentText: text } : cm))
              setChildComments(cs => cs.map(cm => cm.id === comment.id ? { ...cm, commentText: text } : cm))
            }}
            onDeleteComment={(comment) => {
              setShowModal(true)
              setCommentToDelete(comment)
            }}
            activeReplyIdComment={activeReplyIdComment}
            setActiveReplyIdComment={setActiveReplyIdComment}
            comments={comments}
          />
        ))
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">Are you sure you want to delete this comment?</h3>

            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={confirmDelete}>Yes, I&apos;m sure</Button>
              <Button color="gray" onClick={() => setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}

CommentSection.propTypes = {
  idPost: PropTypes.number.isRequired,
  onCommentsNumberChange: PropTypes.func,
}