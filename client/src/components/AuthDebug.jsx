import { useAuth } from "../helpers/useAuth"

export default function AuthDebug(){
    const { user, token, isAuth, setUser, setToken } = useAuth()

    const login = async () => {
        try{
            const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "alice@test.local", password: "alicepass123"})
        })
        if(!res.ok) console.error(await res.json())

        const result = await res.json()
        setToken(result.token)
        setUser(result.user)    
    }
        catch(error){
            console.error(error)
        }
    }

    return(
        <div>
        <button onClick={login}>
            Fake Login
        </button>
        <p>{token || "NO TOKEN"}</p>
        <p>{isAuth.toString() ||  "NO USER"}</p>

        </div>

    )
}