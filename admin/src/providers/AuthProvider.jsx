import { AuthContext } from "../contexts/authContext.jsx";
import { useState } from "react";

export default function AuthProvider({children}){
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("user")
        try { return raw ? JSON.parse(raw) : null } catch { return null}
    })
    const [token, setToken] = useState(() => localStorage.getItem("token"))

    const isAuth = Boolean(user && token)

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }

    const login = (newToken, newUser) => {
        setToken(newToken)
        setUser(newUser)
        localStorage.setItem("token", newToken)
        localStorage.setItem("user", JSON.stringify(newUser))
    }

    const value = {user, token, setUser, setToken, isAuth, logout, login}



    return <AuthContext value={value}>{children}</AuthContext>

}