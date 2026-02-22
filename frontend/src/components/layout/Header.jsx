import React from 'react'
import { Search, ShoppingCart, User } from 'lucide-react'

const Header = () => {
  return (
    <div>
         <header className="w-full p-5 md:px-32 bg-[#d1f2e5]">
            <div className=" px-4 mb-4 flex flex-row items-center justify-between gap-4">
                 <p className='font-bold  text-2xl p-1 cursor-pointer min-w-fit'>
                  <a href="">marketU</a>
                 </p>
              <div className="w-full max-w-xl focus-within:max-w-3xl mx-auto bg-white rounded-full py-2 px-6 shadow-sm border-transparent transition-all duration-300 flex items-center gap-2" >
                <Search className="text-gray-400 w-5 h-5" />
                <input 
                type="text" placeholder="Buscar produtos..."  
                className="w-full bg-transparent outline-none text-sm text-gray-500 italic" />
              </div>

              <div className="flex items-center  md:flex gap-5 ">
                <User className="w-6 h-6 text-gray-700 cursor-pointer hover:text-gray-900" />
                <ShoppingCart className="w-6 h-6 text-gray-700 cursor-pointer hover:text-gray-900" />
              </div>
              
            </div>
         </header>
    </div>
  )
}

export default Header