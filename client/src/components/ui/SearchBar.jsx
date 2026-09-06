import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ placeholder = 'Search...', onSearch, value: externalValue, className = '' }) => {
  const [value, setValue] = useState(externalValue || '');
  const timerRef = useRef(null);

  useEffect(() => {
    if (externalValue !== undefined) setValue(externalValue);
  }, [externalValue]);

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(v), 300);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
      />
      {value && (
        <button onClick={handleClear} className="absolute right-2 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
