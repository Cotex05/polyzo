import React from 'react';

//Stylying Headers
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

//React Router
import { Routes, Route, BrowserRouter } from "react-router-dom";

//Screens
import LoginScreen from './Screen/LoginScreen';
import SignupScreen from './Screen/SignupScreen';

// Context Provider
import { AuthProvider } from './Context/authContext';

// Routes
import PublicRoute from './Routes/PublicRoute';
import PrivateRoute from './Routes/PrivateRoute';

// Components and screens
import Topnavbar from './Components/Topnavbar';
import ProfileScreen from './Screen/ProfileScreen';
import NotFoundScreen from './Screen/NotFoundScreen';
import HomeScreen from './Screen/HomeScreen';
import ProfileEditScreen from './Screen/ProfileEditScreen';
import ExploreScreen from './Screen/ExploreScreen';
import SearchScreen from './Screen/SearchScreen';
import UserProfileScreen from './Screen/UserProfileScreen';

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Topnavbar />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <ProfileScreen />
              </PrivateRoute>}
          />
          <Route
            path="edit-profile"
            element={
              <PrivateRoute>
                <ProfileEditScreen />
              </PrivateRoute>}
          />
          <Route
            path="explore"
            element={
              <PrivateRoute>
                <ExploreScreen />
              </PrivateRoute>}
          />
          <Route
            path="search"
            element={
              <PrivateRoute>
                <SearchScreen />
              </PrivateRoute>}
          />
          <Route
            path="user-profile/:username"
            element={
              <PrivateRoute>
                <UserProfileScreen />
              </PrivateRoute>}
          />
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginScreen />
              </PublicRoute>
            }
          />
          <Route
            path="signup"
            element={
              <PublicRoute>
                <SignupScreen />
              </PublicRoute>}
          />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
