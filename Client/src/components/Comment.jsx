import PropTypes from 'prop-types'
import moment from 'moment'
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
import { Button, Textarea } from 'flowbite-react'
import { useError } from '../contexts/ErrorContext'
import ChildComment from './ChildComment'
import { getAvatarSrc } from "../utils/getAvatarSrc"

import { updateComment } from "../api/commentsApi"
import { getUserById } from "../api/usersApi"

export default function Comment({ comment, onLikeComment, onDislikeComment, onAddChildComment, childrenComments, onEditComment, onDeleteComment, setActiveReplyIdComment, activeReplyIdComment, comments }) {
  const { currentUser } = useSelector((state) => state.user)

  const [user, setUser] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(comment.commentText)
  const [childComment, setChildComment] = useState('')

  const isChildComment = childrenComments.some(child => child.idParent == comment.id)
  const isFirstReply = comment.idParent === null
  const isSmallScreen = window.innerWidth <= 768

  const formattedTime = moment.utc(comment.createdAt).fromNow()

  const { showError } = useError()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserById(comment.idUser)
        setUser(data)
      } catch (err) {
        showError(err.message)
      }
    }
    load()
  }, [comment.idUser])

  const openEdit = async () => {
    setIsEditing(true)
    setEditedText(comment.commentText)
  }

  const handleSave = async () => {
    try {
      await updateComment(comment.id, editedText)
      onEditComment(comment, editedText)
      setIsEditing(false)
    } catch (err) {
      showError(err.message)
    }
  }

  const toggleReplyForm = (commentId) => {
    const allComments = [...comments, ...childrenComments]
    const commentToReply = allComments.find(comment => comment.id === commentId)

    if (commentToReply && commentToReply.username) {
      const replyTo = `@${commentToReply.username}  `
      setChildComment(replyTo)
    } else {
      setChildComment('')
    }

    setActiveReplyIdComment(commentToReply ? commentToReply.id : null)
  }

  return (
    <>
      <div className="flex p-4 border-b dark:border-gray-600 text-sm">
        <div className="flex-shrink-0 mr-3">
          <img className="w-10 h-10 rounded-full bg-gray-200" src={getAvatarSrc(user.profilePicture)} referrerPolicy="no-referrer" alt={user.username} />
        </div>

        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="font-bold mr-1 text-xs truncate">{user ? `${user.username}` : 'anonymous user'}</span>
            <span className="text-gray-500 text-xs">
              {formattedTime}
            </span>
          </div>

          {isEditing ? (
            <>
              <Textarea placeholder='Leave a comment...' className="mb-2" maxLength='200' onChange={(e) => setEditedText(e.target.value)} value={editedText} />
              <div className="flex justify-end gap-2 text-xs">
                <Button type="button" gradientDuoTone='purpleToBlue' size='sm' onClick={() => handleSave()}>Save</Button>
                <Button type="button" gradientDuoTone='purpleToBlue' size='sm' outline onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              {
                comment.isDeleted ? (
                  <>
                    <div className="flex p-3 text-sm text-gray-500 italic">
                      <div className="flex-1">
                        <p className="">Comment is removed</p>
                      </div>
                    </div>
                  </>) : (
                  <>
                    <p className="text-gray-500 pb-2">{comment.commentText}</p>

                    <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
                      <button type="button" disabled={currentUser && currentUser.id === comment.idUser} onClick={() => onLikeComment(comment.id)} className={`text-gray-400 hover:text-blue-500 ${currentUser && comment.likes && comment?.likes.some(like => like.idUser == currentUser.id && like.status == 1) && '!text-blue-500'}`}>
                        <FaThumbsUp className="text-sm" />
                      </button>
                      {comment.likes && comment.likes.filter((like) => like.status == 1).length}

                      <button type="button" disabled={currentUser && currentUser.id === comment.idUser} onClick={() => onDislikeComment(comment.id)} className={`text-gray-400 hover:text-red-500 ml-6 ${currentUser && comment.likes && comment.likes.some(like => like.idUser == currentUser.id && like.status == 2) && '!text-red-500'}`}>
                        <FaThumbsDown className="text-sm" />
                      </button>
                      {comment.likes && comment.likes.filter((like) => like.status == 2).length}

                      {currentUser && (currentUser.id == comment.idUser || currentUser.roleName == 'Admin') && (
                        <>
                          <button type="button" className="text-gray-400 hover:text-blue-500 ml-6" onClick={() => openEdit()}>Edit</button>
                          <button type="button" className="text-gray-400 hover:text-red-500 ml-6" onClick={() => onDeleteComment(comment)}>Delete</button>
                        </>
                      )}
                    </div>
                  </>)
              }
            </>
          )}
        </div>

        {isEditing || comment.isDeleted || currentUser == null ? (
          <></>
        ) : (
          <>
            <div className="-ml-4">
              <Button className="" outline gradientDuoTone='purpleToBlue' onClick={() => toggleReplyForm(comment.id)}>Reply</Button>
            </div >
          </>
        )
        }
      </div>

      {activeReplyIdComment == comment.id &&
        (<div className="p-10">
          <form className="border border-teal-500 rounded-md p-3" onSubmit={(e) => onAddChildComment(e, comment.id, childComment)}>
            <Textarea placeholder='Leave a comment...' rows='3' maxLength='200' onChange={(e) => setChildComment(e.target.value)} value={childComment} />
            <div className='flex justify-between items-center mt-5'>
              <Button outline gradientDuoTone='purpleToBlue' type='submit'>Submit</Button>
            </div>
          </form>
        </div>)}

      {isChildComment && (
        <ChildComment
          childComments={childrenComments}
          idParentComment={comment.id}
          onDeleteComment={onDeleteComment}
          onLikeComment={onLikeComment}
          onDislikeComment={onDislikeComment}
          onEditComment={onEditComment}
          onAddChildComment={onAddChildComment}
          activeReplyIdComment={activeReplyIdComment}
          setActiveReplyIdComment={setActiveReplyIdComment}
          comments={comments}
          isFirstReply={isFirstReply}
          isSmallScreen={isSmallScreen}
        />
      )}
    </>
  )
}

Comment.propTypes = {
  comment: PropTypes.object.isRequired,
  onLikeComment: PropTypes.func.isRequired,
  onDislikeComment: PropTypes.func.isRequired,
  onAddChildComment: PropTypes.func.isRequired,
  childrenComments: PropTypes.array.isRequired,
  onEditComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  setActiveReplyIdComment: PropTypes.func.isRequired,
  activeReplyIdComment: PropTypes.number,
  comments: PropTypes.array.isRequired,
}
