import React from 'react';
import './index.css';
import Navbar from './Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Body from './Body';
import Login from './Login';
import Profile from './Profile';
import { Provider } from 'react-redux'
import appStore from './utils/appStore';
import Feed from './Feed';


function App() {
  return (
    <div>

     <Provider store={appStore}>

     <BrowserRouter basename='/'>

<Routes>




  <Route path='/' element={<Body/>}>
  
  <Route path='/' element={<Feed/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/profile' element={<Profile/>}/>

  </Route>


</Routes>





</BrowserRouter>
     </Provider>
   
    </div>
  );
}

export default App;