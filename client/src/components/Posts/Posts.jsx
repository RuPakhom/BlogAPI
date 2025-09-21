import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SkeletonGrid from "./SkeletonGrid.jsx"
import PostCard from "./PostCard.jsx"
import Header from "../Header/Header.jsx"

export default function Posts(){
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        setLoading(true)
        setError("")

        const url = new URL("/posts", "http://localhost:3000")

        fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (res) => {
            if(!res.ok){
                let msg = "Request failed"
                try{
                    const data = await res.json()
                    msg = data?.message || msg
                } catch {console.log("Unhandled Error")}
                throw new Error(msg)
            }
            return res.json()
        })
        .then((data) => {
            const items = Array.isArray(data.posts) ? data.posts : data?.items ?? []
            const publishedItems = items.filter((item) => item.published)
            console.log(publishedItems)
            setPosts(publishedItems)
        })
        .catch((e) => {
            if(e.name !== "AbortError") setError(e.message || "Load error")
        })
        .finally(() => setLoading(false))
        
    }, [])

    return (
        <section className="max-w-6xl mx-auto px-4 py-6">
      
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
          Last posts
        </h1>
        <p className="text-gray-600">
          From backend
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          Can't load: {error}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-center py-10">Posts not found</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>        
    )
}