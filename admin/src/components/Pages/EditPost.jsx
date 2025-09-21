import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../helpers/useAuth.jsx"
import Header from "../Header/Header.jsx"
import PostCommentsManager from "../PostCommentsManager.jsx"

export default function EditPost() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const API = "http://localhost:3000"

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [published, setPublished] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(new URL(`/posts/${postId}`, API).toString(), {
          headers: { "Content-Type": "application/json" },
        })
        if (!res.ok) throw new Error("Post not found")
        const data = await res.json()
        const p = data?.post ?? data
        if (!p?.id) throw new Error("Malformed post response")
        if (cancelled) return
        setTitle(p.title ?? "")
        setContent(p.content ?? "")
        setPublished(Boolean(p.published))
      } catch (e) {
        if (!cancelled) setError(e.message || "Load error")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [API, postId])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(new URL(`/posts/${postId}`, API).toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          published,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Save failed")
      }
      navigate("/admin/posts", { replace: true })
    } catch (e) {
      setError(e.message || "Network error")
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    if (!confirm("Delete this post?")) return
    setDeleting(true)
    setError("")
    try {
      const res = await fetch(new URL(`/posts/${postId}`, API).toString(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || "Delete failed")
      }
      navigate("/admin/posts", { replace: true })
    } catch (e) {
      setError(e.message || "Network error")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
        <>
        <Header/>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>        
        </>

    )
  }

  if (error) {
    return (
        <>
        <Header/>
        <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
        >
          ← Back
        </button>
      </div>
        </>

    )
  }

  return (
        <>
        <Header/>    
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Post</h1>

      <form onSubmit={onSubmit} className="space-y-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
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
            className="w-full min-h-[220px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your post…"
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

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="sm:w-40 rounded-lg bg-red-600 text-white py-2.5 font-medium hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </form>

      <PostCommentsManager postId={postId}/>
    </div>
    </>
  )
}