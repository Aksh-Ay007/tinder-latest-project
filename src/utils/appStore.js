import { configureStore } from "@reduxjs/toolkit";

import  userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import connectionReducer from "./connectionSlice";  
import requestReducer from "./requestSlice"
import premiumReducer from "./premiumSlice";



const appStore=configureStore({
reducer:{
    user:userReducer,
    feed:feedReducer,
    connections:connectionReducer,
    requests:requestReducer,
    premium: premiumReducer,
}
})


export default appStore;