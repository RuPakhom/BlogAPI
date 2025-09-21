import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../helpers/useAuth.jsx"

export default function AdminRoute() {
    const {isAuth, user} = useAuth()

      if (!isAuth) {
    return <Navigate to={`/login`} replace />
  }

     const isAdmin = user?.role === 'ADMIN'


  if (!isAdmin) {
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

  return <Outlet />

}