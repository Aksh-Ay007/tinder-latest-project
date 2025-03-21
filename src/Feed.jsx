/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import {  BASE_URL} from "./utils/constants";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addFeed } from './utils/feedSlice';
import UserCard from './UserCard';

function Feed() {
  const dispatch=useDispatch()
  const feed=useSelector((store)=>store.feed)
  console.log(feed);
  
  
const getFeed=async()=>{

  if(feed)return;
 try {
  const res=await axios.get(BASE_URL+'/feed',{withCredentials:true});
  dispatch(addFeed(res?.data?.data))
 } catch (error) {
  
  console.log(error);
  
 }
}

useEffect(()=>{

  getFeed()
},[])


  return ( feed &&(<div className='flex justify-center my-20'>


    <UserCard user={feed[0]}/>
    
    </div>)

  );
}

export default Feed;