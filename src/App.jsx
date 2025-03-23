import React from 'react';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Body from './components/Body';
import Login from './components/Login';
import Profile from './components/Profile';
import { Provider } from 'react-redux'
import appStore from './utils/appStore';
import Feed from './components/Feed';
import Connections from './components/Connections';
import ConnectionProfile from './components/ConnectionProfile';
import Requests from './components/Requests';


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
  <Route path='/connections' element={<Connections/>}/>
  <Route path='/requests' element={<Requests/>}/>
  

  </Route>


</Routes>





</BrowserRouter>
     </Provider>
   
    </div>
  );
}

export default App;