/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import axios from 'axios';
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

function Body() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData=useSelector((store)=>store.user);
  
  const fetchuser = async () => {
    
    if(userData)return;
    try {
      const res = await axios.get(BASE_URL + "/profile/view", { withCredentials: true });
      dispatch(addUser(res.data));
      console.log(res.data);
    } catch (error) {
      
      if(error.status===401){
        navigate('/login');
      }

      console.error("Login failed:", error);
    }
  };

  useEffect(() => {

    
    fetchuser();
  }, []); // Add dependency array to ensure useEffect runs only once

  return (
  <div>

<Navbar />
  
  <Outlet />

 <Footer /> 
  </div>
     

  );
}

export default Body;