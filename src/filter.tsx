import React, { useState } from 'react';
import './CountryList.css'

//filtreleme ve gruplama işlemleri için yapılcak butonlar için arayüz
interface FilterProps {
  onSearch: (searchText: string, groupText: string) => void;
  onClear: () => void;
}

//filtreleme bileşeni
const Filter: React.FC<FilterProps> = ({ onSearch, onClear }) => {
  const [filterText, setFilterText] = useState('');

  //arama işlemi
  const handleSearch = () => {
    let [searchText, groupText] = filterText.split(' ');
    if (searchText && groupText) {
      onSearch(searchText, groupText);
    }
    else {
      groupText = ""
      onSearch(searchText, groupText)
    }
  };

  //temizle işlemi
  const handleClear = () => {
    setFilterText('');
    onClear();
  };

  //arama işleminin Enter tuşu ile yapılmaıs
  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  //sayfa düzeni
  return (
    <div className='filter-container'>
      <input
        type="text"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder='Search by Name or Code. Group by Continent, Language or Currency. E.g:tt continent'
        className='filter-input'
      />
      <div className='filter-buttons'>
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClear}>Clear</button>
      </div>
      
    </div>
  );
};

export default Filter;
