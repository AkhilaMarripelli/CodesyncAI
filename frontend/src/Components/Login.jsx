import React, { useState } from 'react'
import Navbar from './Navbar'
import {Link} from 'react-router-dom';
const Login = () => {

  const[formData,setFormData]=useState({
    password:"",
    email:"",
  })

  const changeHandler = (e) =>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }
  const SignIn = async () => {
    console.log("Login Function Executed", formData);
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',  // Changed to application/json
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            return;
        }

        const responseData = await response.json();
        if (responseData.success) {
            localStorage.setItem('auth-token', responseData.token);
            window.location.replace('/');
        } else {
            console.error('Login failed:', responseData.errors);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}


  return (
    <div>
        <Navbar/>
        <div className='flex justify-center items-center h-screen p-50'>
        <div className='px-8 py-8 flex-col flex gap-6 items-start border-2 w-96'>
        <div className='text-3xl font-semibold'>Login</div>
        <div><input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Email address' className='border-2 border-black rounded-lg px-14 py-2' /></div>
        <div><input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' className='border-2 border-black rounded-lg px-14 py-2'/></div>
        <div><button type='submit'onClick={()=>{SignIn()}} className='border-2 border-red-500 px-14 py-2 rounded-lg bg-red-500'>continue</button></div>
        <div>create an account? <Link to="/signup" className='text-red-500'>Click here</Link></div>
      </div>
      </div>
    </div>
  )
}

export default Login
