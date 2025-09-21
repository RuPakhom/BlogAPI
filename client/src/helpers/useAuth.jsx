import { useContext } from "react";
import { AuthContext } from "../contexts/authContext";

export function useAuth(){
    const context = useContext(AuthContext)
    if(!context) throw new Error("useAuth must be called inside AuthProvider")

    return context
}