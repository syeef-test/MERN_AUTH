import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { server } from "../config/config";
import Loading from "../Loading";

function Verify() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useParams();

  async function verifyUser() {
    try {
      console.log("params",params)
      const { data } = await axios.post(`${server}/api/v1/verify/${params.token}`);
      setSuccessMessage(data.message);
    } catch (error) {
      console.log("error",error);
      setErrorMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    verifyUser();
  },[])

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-[200px] m-auto mt-12">
          {successMessage && (
            <p className="text-green-500 text-2xl">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-2xl">{errorMessage}</p>
          )}
        </div>
      )}
      
    </>
  );
}

export default Verify;
