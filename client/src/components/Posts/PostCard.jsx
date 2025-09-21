import { Link } from "react-router-dom"
export default function PostCard({ post }) {
    const title = post.title ?? "(Empty)"
    const preview = post.excerpt ?? 
    (typeof post.content === "string"
        ? post.content.slice(0, 140) + (post.content.length < 140 ? "..." : "")
        : "")
    
        const author = post.author?.name ?? post.authorName ?? post.user?.name ?? "Anon"
        const created = post.createdAt ? new Date(post.createdAt) : null

        const commentsCount = post.comments.length

        return (
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
            <Link to={`/posts/${post.id}`} className="hover:text-blue-600">
                {title}
            </Link>
             </h2>

            {preview && <p className="text-gray-600 text-sm mb-4 line-clamp-3">{preview}</p>}

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Author: {author}</span>
                <span>{created ? created.toLocaleDateString() : ""}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                <span className="text-gray-400">💬</span>
                <span>(Comments: {commentsCount})</span>
            </div>
    </article>
  )
}