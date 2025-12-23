import { createContext, useContext, useEffect, useState } from "react";

import { toast } from "react-toastify";

import api from "../apiIntercepter.js";

const AppContext = createContext(null);

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  async function fetchUser() {
    setLoading(true);
    try {
      const { data } = await api.get(`api/v1/me`);

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function logoutUser(){
    try {
      const {data} = await api.post("/api/v1/logout");
      toast.success(data.message);
      setIsAuth(false);
      setUser(null);
     } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <AppContext.Provider value={{ setIsAuth, isAuth, user, setUser, loading,logoutUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const AppData = () => {
  const context = useContext(AppContext);

  if (!context) throw new Error("AppData must be used within an Appprovider");
  return context;
};

export default AppProvider;
