import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../helpers/useAuth.jsx"
import Header from "../../components/Header/Header.jsx"

export default function CreateNewPost() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [published, setPublished] = useState(true)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(new URL("/posts", "http://localhost:3000").toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          published: published
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Error creating post")
      }

      const data = await res.json()
      const created = data?.post ?? data
      navigate(`/admin/posts/${created.id}/edit`, { replace: true })
    } catch (err) {
      setError(err.message || "Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post title"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your post here..."
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            <label htmlFor="published" className="text-sm text-gray-700">
            Published
            </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create Post"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}