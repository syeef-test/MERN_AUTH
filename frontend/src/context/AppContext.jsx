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

      setUser(data.user);//
      setIsAuth(true);
    } catch (error) {

      console.log(error);
      setUser(null);//
      setIsAuth(false);//
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function logoutUser(navigate){
    try {
      const {data} = await api.post("/api/v1/logout");
      toast.success(data.message);
      sessionStorage.removeItem("csrfToken");
      localStorage.clear();
      setIsAuth(false);
      setUser(null);
      navigate("/login")
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
