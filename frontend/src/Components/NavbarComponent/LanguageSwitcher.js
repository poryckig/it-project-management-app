import React from 'react';
import { useState, useRef, useEffect } from 'react';
import enFlag from '../../img/flags/uk-flag.png';
import plFlag from '../../img/flags/pl-flag.png';

const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef();
  
    const toggleDropdown = () => setIsOpen(!isOpen);
  
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
  
    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
  
    return (
      <div className="relative" ref={dropdownRef}>
        <button onClick={toggleDropdown} className="text-gray-700 hover:text-gray-900">
          {'Zmień język'}
        </button>
        {isOpen && (
          <div className="absolute right-0 bg-white mt-2 py-1 w-48 border rounded-md shadow-lg">
            <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
              <img src={enFlag} alt="English" className="w-6" />
              {'Angielski'}
            </div>
            <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
              <img src={plFlag} alt="Polski" className="w-6" />
              {'Polski'}
            </div>
          </div>
        )}
      </div>
    );
};

export default LanguageSwitcher;