import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import { AppData } from "./context/AppContext";
import Loading from "./Loading";
import Verify from "./pages/Verify";

function App() {
  const { isAuth, loading } = AppData();
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={isAuth ? <Home />:<Login/>} />
            <Route path="/login" element={isAuth ? <Home />:<Login/>} />
            <Route path="/register" element={isAuth ? <Home />:<Register/>} />
            <Route path="/verifyotp" element={isAuth ? <Home />:<VerifyOtp/>} />
            <Route path="/token/:token" element={isAuth ? <Home />:<Verify/>} />
            <Route path="/dashboard" element={isAuth ? <Dashboard />:<Login/>} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
