import { useState } from 'react'
import Home from './Components/Home';
import {BrowserRouter, Routes,Route} from 'react-router-dom';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Cart from './Components/Cart';
import Myassistant from './Components/myassistant';
import SchedulePage from './Components/SchedulePage';
function App() {
  
  return (
    <>
    <BrowserRouter>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='login' element={<Login/>}/>
      <Route path='signup' element={<Signup/>}/>
      <Route path='/cart' element={<Cart/>}/>
      <Route path='/myassistant' element={<Myassistant/>}/>
      <Route path='/schedulepage' element={<SchedulePage/>}/>
      </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
