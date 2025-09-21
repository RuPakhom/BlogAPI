import Header from "../Header/Header.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage(){
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({form : "", fields: {}})

    const validate = () => {
        const fieldErr = {}
        if(!name.trim() || name.trim().length < 3) fieldErr.name = "Name from 3 characters"
        if (!/^\S+@\S+\.\S+$/.test(email)) fieldErr.email = "Incorrect email"
        if (password.length < 6) fieldErr.password = "Password from 6 characters"
        if (password !== confirm) fieldErr.confirm = "Passwords not match"

        setErrors((e) => ({ ...e, fields: fieldErr, form: ""}))
        return Object.keys(fieldErr).length === 0
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        if(!validate()) return
        setLoading(true)
        setErrors({ form: "", fields: {} })

        try{
            const res = await fetch(new URL("/auth/register", "http://localhost:3000").toString() , {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                })
            })


        const tryRead = async () => {
            try {
                const data = await res.json()
                return data
            }
            catch {
                return {}
            }
        }

        if(!res.ok) {
            const data = await tryRead()
            console.log(data)
            const msg = data?.message || data?.errors || "Registration error"

            const f = {}
            if (Array.isArray(data?.errors)) {
                data.errors.forEach((er) => {
                    if(er?.path && er?.msg) f[er.path] = er.msg
                })
            }

            setErrors({form: msg, fields: f})
            return
        }
            navigate("/login", {replace: true})
    } catch(err) {
        setErrors({ form: err.message || "Network Error", fields: {}})
    } finally {
        setLoading(false)
    }
    }

    const FieldError = ({ name }) => errors.fields?.[name] ? (
        <p className="text-sm text-red-600 mt-1">{errors.fields[name]}</p>
    ) : null

    return (
        <>
        <Header />
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Register</h1>
        <p className="text-gray-600 mb-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>

        {errors.form && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {errors.form}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ivan"
              minLength={3}
              maxLength={30}
              required
            />
            <FieldError name="name" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
            <FieldError name="email" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
            <FieldError name="password" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat Password"
              minLength={6}
              required
            />
            <FieldError name="confirm" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>
      </div>
    </div>
        </>
    )
}