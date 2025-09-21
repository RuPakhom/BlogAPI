import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../helpers/useAuth.jsx"
import Header from "../Header/Header.jsx"

export default function EditPostsList() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const url = new URL("/posts", "http://localhost:3000")
        const res = await fetch(url.toString(), {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.message || "Failed to load posts")
        }
        const data = await res.json()
        const items = data.posts
        if (!cancelled) setPosts(items)
      } catch (e) {
        if (!cancelled) setError(e.message || "Load error")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-white border border-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
          No posts yet.
        </div>
      </div>
    )
  }

  return (
<>
<Header/>
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Posts</h1>

      <ul className="divide-y rounded-xl border border-gray-200 bg-white">
        {posts.map((p) => {
          const commentsCount = p.comments.length ?? 0
          const published = Boolean(p.published)
          const updated = p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""
          return (
            <li
              key={p.id}
              onClick={() => navigate(`/admin/posts/${p.id}/edit`)}
              className="cursor-pointer px-4 py-3 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {p.title || "Untitled"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {updated && <>Updated: {updated} • </>}
                    💬 {commentsCount}
                  </div>
                </div>

                <span
                  className={
                    "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs " +
                    (published
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700")
                  }
                >
                  {published ? "Published" : "Draft"}
                </span>
              </div>
            </li>

          )
        })}
      </ul>
    </div>
    </>
  )
}