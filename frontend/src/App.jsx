import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import { ToastContainer } from "react-toastify";
import { AppData } from "./context/AppContext";
import Loading from "./Loading";

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
            <Route path="/verifyotp" element={isAuth ? <Home />:<VerifyOtp/>} />
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
