import React from "react";
import { BrowserRouter,Route,Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import {ToastContainer} from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        
      </Routes>
      <ToastContainer/>
      </BrowserRouter>
    </>
  );
}

export default App;
