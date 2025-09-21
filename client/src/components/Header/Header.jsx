import { Link } from "react-router-dom"
import { useAuth } from "../../helpers/useAuth.jsx"
export default function Header(){
    const {user, logout} = useAuth()
    return(
        <header className="bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-1 py-3">
                <Link to="/" className="text-2xl font-bold text-gray-800">BlogProject</Link>
                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 transition">Main</Link>
                    <Link to="/posts" className="text-gray-600 hover:text-blue-600 transition">Posts</Link>
                </nav>
                <div className="flex items-center space-x-2">
                    {user ? (
                        <div className="flex items-center space-x-3">
                        <span className="text-gray-700 font-medium">
                        Hello, {user.name}
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                        Logout
                        </button>
                        </div>
                        ) : ( 
                            <>
                                <Link to="/login" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">Login</Link>
                                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Register</Link>
                            </>     
                            )}          
                </div>
            </div>
        </header>
    )
}