import { Link } from "react-router-dom"
import PropTypes from "prop-types"
export default function PostCard({ post }) {
  const API_BASE = "https://marko-blog-bfdqeaf7dqacb3e7.westeurope-01.azurewebsites.net";

  return (
    <div className="group relative flex-1 min-w-[250px] w-full border h-[400px] overflow-hidden rounded-lg sm:w-[430px] border-teal-500 hover:border-2 transition-all">
      <Link to={`/post/${post.id}`}>
        <img
          src={`${API_BASE}/Images/${post.imageName}`}
          alt="post cover"
          className="p-4 h-[210px] w-full object-contain group-hover:h-[220px] transition-all duration-300 z-20"
        />
      </Link>

      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-2">
          {post.title.length >= 25 ? post.title.substring(0, 25) + "..." : post.title}
        </p>

        <p>
          Categories:{" "}
          {post.categories.map((category, index) => (
            <span className="italic" key={category.id}>
              {category.name}
              {index !== post.categories.length - 1 && ","}{" "}
            </span>
          ))}
        </p>

        <p>
          Author: <span className="italic">{post.username}</span>
        </p>

        <Link
          to={`/post/${post.id}`}
          className="z-10 group-hover:bottom-0 absolute bottom-[-200px] left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center py-2 rounded-md !rounded-tl-none m-2"
        >
          Read article
        </Link>
      </div>
    </div>
  )
}

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    imageName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
}
