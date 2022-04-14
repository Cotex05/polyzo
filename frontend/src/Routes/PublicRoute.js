import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../Context/authContext"


const PublicRoute = ({ children }) => {

    const location = useLocation();
    const { currentUser } = useAuth()

    return currentUser ? <Navigate state={{ path: location.pathname }} to="/profile" replace /> : children;
}

export default PublicRoute;