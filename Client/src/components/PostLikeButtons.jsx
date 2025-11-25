import { FaThumbsUp, FaThumbsDown, FaRegCommentDots } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

const PostLikeButtons = ({ post, idPost, onPostVote, commentsNumber }) => {
  const { currentUser } = useSelector((state) => state.user)

  return (
    <div className="text-sm mb-8 mt-12 flex items-center justify-between gap-1">
      <div className="flex">
        <FaRegCommentDots className="text-2xl" />
        <span className="ml-2">
          {commentsNumber === 1 ? `${commentsNumber} Comment` : `${commentsNumber} Comments`}
        </span>
      </div>
      <div className="flex ml-10">
        <button
          type="button"
          disabled={currentUser && currentUser.id === post.idUser}
          onClick={() => onPostVote(idPost, 1)}
          className="text-gray-400 hover:text-blue-500 ml-6"
        >
          <FaThumbsUp className="text-xl" />
        </button>
        <span className="ml-2">{post.likes && post.likes.filter((like) => like.status === 1).length}</span>

        <button
          type="button"
          disabled={currentUser && currentUser.id === post.idUser}
          onClick={() => onPostVote(idPost, 2)}
          className="text-gray-400 hover:text-red-500 ml-2"
        >
          <FaThumbsDown className="ml-5 text-xl" />
        </button>
        <span className="ml-2">{post.likes && post.likes.filter((like) => like.status === 2).length}</span>
      </div>
    </div>
  )
}

PostLikeButtons.propTypes = {
  post: PropTypes.shape({
    likes: PropTypes.arrayOf(
      PropTypes.shape({
        status: PropTypes.number.isRequired,
      })
    ).isRequired,
    idUser: PropTypes.number.isRequired,
  }).isRequired,
  idPost: PropTypes.number.isRequired,
  onPostVote: PropTypes.func.isRequired,
  commentsNumber: PropTypes.number.isRequired,
}

export default PostLikeButtons