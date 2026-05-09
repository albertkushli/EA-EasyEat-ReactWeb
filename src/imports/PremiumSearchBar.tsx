import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, DollarSign, X } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: any) => void;
  placeholder?: string;
}

export const PremiumSearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Search restaurants...',
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    distance: 'all',
    time: 'all',
    price: 'all',
  });

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 left-4 right-4 md:left-auto md:top-6 md:right-4 md:w-96 z-40 pointer-events-auto"
    >
      {/* Search input */}
      <motion.div
        className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg overflow-hidden"
        animate={isExpanded ? { boxShadow: '0 20px 40px rgba(0,0,0,0.15)' } : {}}
      >
        <div className="flex items-center px-4 py-3 gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(query.length > 0)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none text-sm"
          />
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleSearch('')}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </motion.button>
          )}
        </div>

        {/* Filter chips */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 p-3 space-y-2"
            >
              {/* Distance filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Distance
                </label>
                <div className="flex gap-2">
                  {['all', '1km', '5km', '10km'].map((dist) => (
                    <motion.button
                      key={dist}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleFilterChange('distance', dist)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        filters.distance === dist
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {dist === 'all' ? 'All' : dist}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Delivery time filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Delivery Time
                </label>
                <div className="flex gap-2">
                  {['all', '<15', '<30', '<45'].map((time) => (
                    <motion.button
                      key={time}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleFilterChange('time', time)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        filters.time === time
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time === 'all' ? 'All' : `${time}m`}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price
                </label>
                <div className="flex gap-2">
                  {['all', '$', '$$', '$$$'].map((price) => (
                    <motion.button
                      key={price}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleFilterChange('price', price)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        filters.price === price
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {price === 'all' ? 'All' : price}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PremiumSearchBar;

