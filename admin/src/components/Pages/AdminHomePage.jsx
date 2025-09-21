import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../helpers/useAuth.jsx"
import Header from "../Header/Header.jsx";

export default function AdminHomePage(){
    const navigate = useNavigate()
    const {isAuth, user} = useAuth()

    useEffect(() => {
        if(!isAuth){
            navigate("/login", {replace: true})
        }
    }, [isAuth, navigate])

    if(!isAuth) return null
    const isAdmin = user?.role === 'ADMIN'
    if(!isAdmin){
    return (
        <>
        <Header/>
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No access</h1>
          <p className="text-gray-600 mb-4">
            You don't have needed access
          </p>
          <div className="flex gap-3">
            <Link to="/" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
                Go to the main page
            </Link>
            <Link to="http://localhost:5173/" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Go to blog
            </Link>
          </div>
        </div>
      </div>        
        </>

    )
    }
    return (
        <>
        <Header/>
        <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Admin-panel</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminLink to="/admin/posts/new" title="Create Post" desc="New post in blog" primary />
        <AdminLink to="/admin/posts" title="Edit posts" desc="List and edit posts" />
        <AdminLink to="/admin/comments" title="Comments" desc="Moderate comments" />
      </div>
    </div>
        </>

  )
}

function AdminLink({to, title, desc, primary = false, disabled = false }){
    const base =
    "block rounded-xl border p-5 shadow-sm transition " +
    (primary
      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
      : "bg-white border-gray-200 hover:shadow-md")

  if (disabled) {
    return (
      <div className={base + " opacity-50 pointer-events-none"}>
        <div className="text-lg font-semibold">{title}</div>
        <div className={primary ? "text-blue-100" : "text-gray-500"}>{desc}</div>
      </div>
    )
  }

  return (
    <Link to={to} className={base}>
      <div className="text-lg font-semibold">{title}</div>
      <div className={primary ? "text-blue-100" : "text-gray-500"}>{desc}</div>
    </Link>
  )
}