import React, { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import remove_icon from './Assets/Frontend_Assets/cart_cross_icon.png';
import Navbar from './Navbar';

const CartItems = () => {
    const {getTotalCartAmount,all_product, cartItems, removeFromCart } = useContext(ShopContext);
    console.log(getTotalCartAmount());
    return (
        <>
            <Navbar />
            <table className='m-16 border-2 w-[80%]'>
                <thead>
                    <tr className='bg-gray-200'>
                        <th className='px-4 py-2'>Products</th>
                        <th className=' px-4 py-2'>Title</th>
                        <th className=' px-4 py-2'>Price</th>
                        <th className=' px-4 py-2'>Quantity</th>
                        <th className=' px-4 py-2'>Total</th>
                        <th className=' px-4 py-2'>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {all_product.map((product) => {
                        if (cartItems[product.id] > 0) {
                            return (
                                <tr key={product.id} className='border-2'>
                                    <td className='px-4 py-2'>
                                        <img src={product.image} alt={product.name} className='w-18 h-20' />
                                    </td>
                                    <td className='px-4 py-2'>{product.name}</td>
                                    <td className='px-4 py-2'>${product.new_price.toFixed(2)}</td>
                                    <td className='px-4 py-2 flex justify-center'><button className='px-4 py-1 bg-gray-300'>{cartItems[product.id]}</button></td>
                                    <td className='px-4 py-2'>${(product.new_price * cartItems[product.id]).toFixed(2)}</td>
                                    <td className='pl-16 py-2'>
                                        <img 
                                            src={remove_icon} 
                                            alt="Remove" 
                                            onClick={() => removeFromCart(product.id)} 
                                            className='cursor-pointer'
                                        />
                                    </td>
                                </tr>
                            );
                        }
                        return null;
                    })}
                </tbody>
            </table>
            <div className='flex gap-5 m-16 w-[80%] justify-between'>
            <div className='flex-col flex gap-4  w-[50%]'>
                <div className='flex-col flex gap-2'>
                    <h1 className='font-semibold text-2xl'>Cart Totals</h1>
                    <div className='flex gap-3'>
                        <p className='font-medium'>SubTotal</p>
                        <p>${getTotalCartAmount()}</p>
                    </div>
                    <hr/>
                    <div className='flex gap-3'>
                        <p className='font-medium'>Shipping Fee</p>
                        <p>Free</p>
                    </div>
                    <hr/>
                    <div className='flex gap-3'>
                        <h3 className='font-medium'>Total</h3>
                        <h3>${getTotalCartAmount()}</h3>
                    </div>
                </div>
                <div>
                <button className='px-4 py-2 border-2 bg-red-500 text-white'>PROCEED TO CHECKOUT</button>
                </div>
                
            </div>
            <div className='flex-col border-none flex gap-4'>
                <p className='font-medium'>If you have a promo code, Enter it here</p>
                <div className='border-2 px-4 py-1 bg-gray-200 flex'>
                    <input type="text" placeholder='promocode' className='bg-transparent outline-none'/>
                    <button className='border-2 bg-black text-white px-6 py-2 '>Submit</button>
                </div>
            </div>
            </div>
        </>
    );
};

export default CartItems;
