import React from "react";
import { BrowserRouter,Route,Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import {ToastContainer} from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/verifyotp" element={<VerifyOtp/>}/>

        
      </Routes>
      <ToastContainer/>
      </BrowserRouter>
    </>
  );
}

export default App;
