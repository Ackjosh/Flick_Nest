import React, { useState } from 'react';
import { SidebarTrigger } from './ui/Sidebar';
import { Search } from 'lucide-react';
import { LogIn, UserPlus, LogOut } from "lucide-react";
import hamburgerIcon from '../assets/hamburger.svg';

function Header({ onSearch, onResetList, toggleDarkMode, isDarkMode, user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery.toLowerCase());
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    onResetList();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="text-white p-4 flex justify-between items-center shadow-md bg-[rgb(28,28,28)] backdrop-blur-md border border-white/30 rounded-xl h-20">
      <div className="flex items-center space-x-4">
        <SidebarTrigger>
          <div className="hamburger hover:cursor-pointer">
            <img
              src={hamburgerIcon}
              alt="Menu"
              className="w-6 h-6 invert"
            />
          </div>
        </SidebarTrigger>

        <a
          href="#"
          onClick={handleHomeClick}
          className="text-xl font-bold hover:text-gray-300 transition"
        >
          FlickNest
        </a>
      </div>

      <div className="options">
        <ul className='flex flex-wrap gap-7 cursor-pointer'>
        </ul>
      </div>

      <div className="flex items-center space-x-4 text-white">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search Movies..."
            className="w-58 p-2 border border-gray-700 rounded-l-md focus:outline-none focus:border-blue-500 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="px-4 py-2 bg-gray-800 text-white transition rounded-br-2xl rounded-bl-2xl rounded-tl-2xl rounded-tr-2xl cursor-pointer flex items-center justify-center"
            onClick={handleSearch}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="user flex items-center space-x-2">
          {user ? (
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-5 py-3 rounded-full font-medium text-center transition-all duration-300 hover:bg-red-700 flex items-center justify-center cursor-pointer"
            >
              <LogOut className="mr-2" size={18} /> Log Out
            </button>
          ) : (
            <>
              <a
                href="sign-in"
                className="border border-cng-green text-cng-black px-5 py-3 rounded-full font-medium text-center transition-all duration-300 hover:bg-cng-green hover:text-white flex items-center justify-center"
              >
                <LogIn className="mr-2" size={18} /> Login
              </a>
              <a
                href="sign-up"
                className="bg-cng-green text-white px-5 py-3 rounded-full font-medium text-center transition-all duration-300 hover:bg-cng-darkgreen flex items-center justify-center"
              >
                <UserPlus className="mr-2" size={18} /> Register
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
