import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Execute search when debounced value changes
  useState(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const doSearch = async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/patients/search?q=${encodeURIComponent(debouncedSearch)}`);
        if (data.success) {
          setSearchResults(data.data.patients);
          setShowDropdown(true);
        }
      } catch (_) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };
    doSearch();
  }, [debouncedSearch]);

  const handleSelect = (patient) => {
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
    navigate(`/patients/${patient._id}`);
  };

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center gap-4 no-print">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search patients by name, ID, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          {searching && (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Search dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((patient) => (
              <button
                key={patient._id}
                onClick={() => handleSelect(patient)}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-blue-700">
                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                  <p className="text-xs text-gray-500">{patient.patientId} · {patient.phone || '—'}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 px-4 py-3">
            <p className="text-sm text-gray-500">No patients found.</p>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Date */}
        <p className="hidden md:block text-xs text-gray-500">{today}</p>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{getInitials(user?.name)}</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500 leading-tight">{user?.specialization}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
