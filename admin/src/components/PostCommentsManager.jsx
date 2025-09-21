import { useEffect, useState } from "react"
import { useAuth } from "../helpers/useAuth.jsx"

export default function PostCommentsManager({postId}) {
  const { token } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(new URL(`/posts/${postId}/comments`, "http://localhost:3000").toString(), {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        })
        if (!res.ok) throw new Error((await tryJson(res))?.message || "Failed to load comments")
        const data = await tryJson(res)
        console.log(data)
        const items = data.comments
        if (!cancelled) setComments(items)
      } catch (e) {
        if (!cancelled) setError(e.message || "Load error")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (postId) load()
    return () => { cancelled = true }
  }, [postId, token])

  // helpers
  const updateLocal = (id, patch) =>
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const patchComment = async (id, patch) => {
    const res = await fetch(new URL(`posts/${postId}/comments/${id}`, "http://localhost:3000").toString(), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error((await tryJson(res))?.message || "Update failed")
    return tryJson(res)
  }

  const deleteComment = async (id) => {
    console.log(id)
    const res = await fetch(new URL(`posts/${postId}/comments/${id}`, "http://localhost:3000").toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    })
    if (!res.ok) throw new Error((await tryJson(res))?.message || "Delete failed")
  }

  // actions

  const onSaveText = async (c, newText) => {
    const trimmed = newText.trim()
    if (!trimmed || trimmed === c.content) return
    setSavingId(c.id)
    const prev = c.content
    updateLocal(c.id, { content: trimmed })
    try {
      await patchComment(c.id, { content: trimmed })
    } catch (e) {
      updateLocal(c.id, { content: prev }) 
      alert(e.message || "Error")
    } finally {
      setSavingId(null)
    }
  }

  const onDelete = async (c) => {
    if (!confirm("Delete this comment?")) return
    setDeletingId(c.id)
    const prev = comments
    setComments((p) => p.filter((x) => x.id !== c.id))
    try {
      await deleteComment(c.id)
    } catch (e) {
      setComments(prev)
      alert(e.message || "Error")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
    <section className="mt-10">
      <h2 className="text-lg font-semibold mb-3">Comments</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <ListSkeleton />
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">
          No comments.
        </div>
      ) : (
        <ul className="divide-y rounded-xl border border-gray-200 bg-white">
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              saving={savingId === c.id}
              deleting={deletingId === c.id}
              onSave={(text) => onSaveText(c, text)}
              onDelete={() => onDelete(c)}
            />
          ))}
        </ul>
      )}
    </section>
    </>
  )
}

function CommentRow({ comment, saving, deleting, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(comment.content ?? "")

  const author = comment.author?.name ?? comment.authorName ?? "Anonymous"
  const date = comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""

  return (
    <>
    <li className="px-4 py-3">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">{author}</span>
            {date && (
              <>
                <span>•</span>
                <span>{date}</span>
              </>
            )}
          </div>

          {!editing ? (
            <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>

              <button
                onClick={onDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditing(false)
                  setText(comment.content ?? "")
                }}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  onSave(text)
                }}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </li>
    </>
  )
}

function ListSkeleton() {
  return (
    <>
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse py-3 border-b last:border-b-0">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
    </>
  )
}

async function tryJson(res) {
  try { return await res.json() } catch { return {} }
}
