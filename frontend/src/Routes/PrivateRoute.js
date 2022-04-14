import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../Context/authContext"


const PrivateRoute = ({ children }) => {

    const location = useLocation();
    const { currentUser } = useAuth()

    return currentUser ? children : <Navigate state={{ path: location.pathname }} to="/login" replace />;
}

export default PrivateRoute;