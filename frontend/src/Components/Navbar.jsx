import React,{useContext, useState} from 'react'

import { Link } from 'react-router-dom';
const Navbar = () => {

  return (
    <div className='flex justify-around shadow-black items-center bg-gradient-to-r from-teal-600 to-blue-500'>
      <div className='flex items-center gap-10'>
        <p className='text-black-600 size-[38px] font-semibold content-center'><Link to='/' className='text-2xl font-semibold font-serif text-white'>MyAssistant</Link></p>
      </div>
      
      <div className='flex gap-4 items-center cursor-pointer'>
        {localStorage.getItem('auth-token')?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace('/')}} className='text-2xl font-semibold font-serif text-white'>Logout</button>:
        <button className='border-2 border-black px-4 py-1 rounded-full'><Link to='/login' className='text-2xl font-semibold font-serif text-white'>Login</Link></button>}
      </div>
    </div>
  )
}

export default Navbar
