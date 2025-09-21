import { useEffect, useState } from "react"
import { useAuth } from "../../helpers/useAuth.jsx"
import SkeletonGridComment from "./SkeletonGridComment.jsx"
import { Link } from "react-router-dom"
import { useParams } from "react-router-dom";
import Header from "../Header/Header.jsx";


export default function PostPage(){
    const [post, setPost] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [cLoading, setCLoading] = useState(false)
    const [cError, setCError] = useState("")
    const [content, setContent] = useState("")
    const [authorName, setAuthorName] = useState("")

    const {user, token} = useAuth()
    const { postId } = useParams()

    useEffect(() => {
        setLoading(true)
        setError("")

        fetch(new URL(`/posts/${postId}`, 'http://localhost:3000').toString(), {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (res) => {
            if(!res.ok) throw new Error("Posts can't be loaded")
            return res.json()
        }).then((data) => {
            const item = data.post ? data.post : null
            setPost(item)
            const commentItems = data.post?.comments ?? []
            setComments(commentItems)
        }).catch((e) => {
            if(e.name !== "AbortError") setError(e.message || "Loading Error")
        }).finally(() => setLoading(false))

        
        
    }, [postId])

    const commentsCount = comments.length

    const submitComment = async (e) => {
        e.preventDefault();
        setCError("")
        if(!content.trim()) return setCError("Add comment")

        setCLoading(true)
        try{
            const res = await fetch(
                new URL(`/posts/${postId}/comments`, 'http://localhost:3000').toString(),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? {Authorization: `Bearer ${token}`} : {}),
                    },
                    credentials: "include",
                    body: JSON.stringify({
                    authorName: user?.name ?? authorName,
                    email: user?.email ?? null,
                    userId: user?.id ?? null,
                    content: content.trim(),
                    postId: postId,
                    })
                }
            )
            if(!res.ok){
                console.log(await res.json().errors)
                throw new Error("Can't send comment")
            } 
            const newComments = await res.json()
            setComments((prev) => [newComments.comment, ...prev])
            setContent("")
            setAuthorName("")
        }
        catch (e) {
            setCError(e.message || "Send Error")
            console.error(e.message)
        }
        finally {
            setCLoading(false)
        }
    }
    
    if(loading){
        return <SkeletonGridComment/>
    }

    if(error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-600 mb-4">Error: {error || "Post not found"}</p>
        <Link to="/posts" className="text-blue-600 hover:underline">
          ← Back to Posts
        </Link>
      </div>
    )
    }

    const created = post.createdAt ? new Date(post.createdAt) : null
    const author = post.author?.name ?? post.authorName ?? post.user?.name ?? "Anon"

    return (
        <>
    <Header/>
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/posts" className="text-sm text-blue-600 hover:underline">
          ← Back to posts
        </Link>
      </div>

      <article className="bg-white border border-gray-200 rounded-2xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{post.title ?? "(No name)"}</h1>

        <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-3">
          <span>Author: {author}</span>
          {created && <span>{created.toLocaleDateString()}</span>}
          <span className="flex items-center gap-1">
            <span className="text-gray-400">💬</span>
            Comments: {commentsCount}
          </span>
        </div>


        <div className="prose max-w-none mt-6">
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </p>
        </div>
      </article>


      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Comments ({comments.length})</h2>

        <form onSubmit={submitComment} className="bg-white border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
          {!user && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                minLength={3}
                maxLength={30}
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Comment</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[100px] rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Напишите что-нибудь…"
              maxLength={20000}
              required
            />
          </div>
          {cError && <p className="text-sm text-red-600">{cError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={cLoading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {cLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p className="text-gray-500">Not yet commented</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-gray-800">{c.content}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {c.author?.name ?? c.authorName ?? "Anon"} •{" "}
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </>
  )}