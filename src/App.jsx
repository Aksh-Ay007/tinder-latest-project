import React from 'react';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Body from './components/Body';
import Login from './components/Login';
import Signup from './components/Signup'
import Profile from './components/Profile';
import { Provider } from 'react-redux'
import appStore from './utils/appStore';
import Feed from './components/Feed';
import Connections from './components/Connections';
import Requests from './components/Requests';
import ConnectionProfileUI from './components/ConnectionProfileUI';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Premium from './components/Premium';
import Chat from './components/Chat';
import Messages from './components/Messages';

function App() {
  return (
    <div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
      />

     <Provider store={appStore}>

     <BrowserRouter basename='/'>

<Routes>




  <Route path='/' element={<Body/>}>
  
  <Route path='/' element={<Feed/>}/>
  <Route path='/login' element={<Login/>}/>
  <Route path='/signin' element={<Signup/>}/>

  
  <Route path='/profile' element={<Profile/>}/>
  <Route path='/userProfile' element={<ConnectionProfileUI/>}/>
  <Route path='/connections' element={<Connections/>}/>
  <Route path='/requests' element={<Requests/>}/>
  <Route path='/premium' element={<Premium/>}/>
  <Route path='/chat/:targetUserId' element={<Chat/>}/>
  <Route path='/messages' element={<Messages/>}/>
  

  </Route>


</Routes>





</BrowserRouter>
     </Provider>
   
    </div>
  );
}

export default App;