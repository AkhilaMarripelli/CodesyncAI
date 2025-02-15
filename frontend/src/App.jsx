import { useState } from 'react'
import Home from './Components/Home';
import {BrowserRouter, Routes,Route} from 'react-router-dom';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Cart from './Components/Cart';
function App() {
  return (
    <>
    <BrowserRouter>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='login' element={<Login/>}/>
      <Route path='signup' element={<Signup/>}/>
      <Route path='/cart' element={<Cart/>}/>
     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
