import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { GET_COUNTRIES } from './query'
import Filter from './filter'
import './CountryList.css'

interface Country {
  code: string
  name: string
  continent: {
    name: string
  }
  capital: string
  currency: string
  languages: {
    name: string
  }[]
  isSelected?: boolean //ülke şeçimi
  backgroundColor?: string //ülke arkaplanı
}

//ülke listesi bileşeni
const CountryList: React.FC = () => {
  const { loading, error, data } = useQuery(GET_COUNTRIES) //apollo client graphql sorgusu
  const [allCountries, setAllCountries] = useState<Country[]>([]) //ülke verileri
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]) //filtrelenmiş ülkeler
  const [currentPage, setCurrentPage] = useState<number>(1) //sayfa numaraları
  const [groupByTitle, setGroupByTitle] = useState<string>('') //gruplama
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(0) //renkler
  
  //renk listesi
  const colorList: string[] = [
    "Yellow", "SteelBlue", "SpringGreen", "Tomato", "Violet", 
    "Orange", "Lime", "FireBrick", "Chartreuse", "CornflowerBlue",  
  ]

  //bütün veya filtrelenmiş ülkelerin seçilmemiş olarak gösterilmesi
  useEffect(() => {
    if (data && data.countries) {
      setAllCountries(data.countries.map((country: any) => ({ ...country, isSelected: false })));
      setFilteredCountries(data.countries.map((country: any) => ({ ...country, isSelected: false })));
    }
  }, [data])

  const pageSize = 15 //sayfa başına gösterilecek ülke sayısı
  let filteredData = allCountries //bütün ülkeler

  //sayfalama fonksiyonu
  const getPaginatedCountries = (page: number): Country[] => {
    const startIndex = (page - 1) * pageSize
    return filteredCountries.slice(startIndex, startIndex + pageSize)
  }

  //arama ve gruplama fonksiyonu
  const handleFilterSearch = (searchText: string, groupText: string) => {

    //filtreleme kısmı boş ise uyarı
    if (!searchText && !groupText) {
      setFilteredCountries(filteredData)
      const indexToSelect = 9
      filteredData[indexToSelect].isSelected = true
      filteredData[indexToSelect].backgroundColor = getNewColor()
    } else {
      let searchValue = searchText.toLowerCase()
      let groupValue = groupText.toLowerCase()
      //search kısmı boş ancak filtreleme bölümü gruplama kriterlerinden birini içeriyorsa
      if (searchValue === "continent" || searchValue === "currency" || searchValue === "language") {
        groupValue = searchValue
        searchValue = ""
      }
      let updatedFilteredData = [...allCountries] //bütün ülkelerin kopyası
      //bütün ülkelerin seçilme özelliklerinin ve arka planlarının belirlenmesi
      updatedFilteredData.forEach((country) => {
        country.isSelected = false
        country.backgroundColor = undefined
      })

      //arama bölümü
      if (searchValue && (searchValue !== "")) {
        updatedFilteredData = updatedFilteredData.filter(
          (country: Country) =>
            country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            country.code.toLowerCase().includes(searchValue.toLowerCase())
        )
      }
  
      let groupedData = updatedFilteredData //filtreleme sonucu ülkelerin kopyalanması

      //kıta bilgisine göre gruplama bölümü
      if (groupValue) {
        if (groupValue === 'continent') {
          const groupedCountries: { [key: string]: Country[] } = {} //ülkeleri gruplamak için
          //ülkeleri gruplama

          updatedFilteredData.forEach((country) => {
            const continentName = country.continent.name.toLowerCase()
            if (!groupedCountries[continentName]) {
              groupedCountries[continentName] = []
             }
            groupedCountries[continentName].push(country)
          })
    
          groupedData = [] //ülkeleri alfabetik sıralama için dizinin boşaltılması
          const sortedCountriesByContinent = Object.keys(groupedCountries).sort() //alfabetik sıralama
           
          //alfabetik gruplama
          sortedCountriesByContinent.forEach((continentName) => {
            groupedData.push(...groupedCountries[continentName])
          })
        }
  
        //para birimi bilgisine göre gruplama bölümü
        else if (groupValue === 'currency') {
      
          const groupedCountries: { [key: string]: Country[] } = {} //ülkeleri gruplamak için
  
          //ülkeleri gruplama
          updatedFilteredData.forEach((country) => {
            const currencyName = country.currency
            if (!groupedCountries[currencyName]) {
              groupedCountries[currencyName] = []
            }
            groupedCountries[currencyName].push(country)
          })
  
          groupedData = [] //ülkeleri alfabetik sıralama için dizinin boşaltılması
          const sortedCountriesByContinent = Object.keys(groupedCountries).sort() //alfabetik sıralama
   
          //alfabetik gruplama
          sortedCountriesByContinent.forEach((continentName) => {
            groupedData.push(...groupedCountries[continentName])
          })
        }
  
        //dil bilgisine göre gruplama bölümü
        else if (groupValue === 'language') {
        
          const groupedCountries: { [key: string]: Country[] } = {} //ülkeleri gruplamak için
        
          //ülkeleri gruplama
          updatedFilteredData.forEach((country) => {
            const languageName = country.languages.map((lang) => lang.name).join(', ').toLowerCase() 
            if (!groupedCountries[languageName]) {
              groupedCountries[languageName] = []
            }
            groupedCountries[languageName].push(country)
          })
    
          groupedData = [] //ülkeleri alfabetik sıralama için dizinin boşaltılması
          const sortedCountriesByContinent = Object.keys(groupedCountries).sort() //alfabetik sıralama
              
          //alfabetik gruplama
          sortedCountriesByContinent.forEach((continentName) => {
            groupedData.push(...groupedCountries[continentName])
          })
        } else {
          if (groupedData.length > 0) {
            alert("Grouping is not appropriate. Therefore, only filtering will be done. Use continent,currency or language to group")
          }
        }
      }

      //10. veya son ülkenin seçilmesi
      const indexToSelect = Math.min(9, groupedData.length - 1)
    
      if (indexToSelect >= 0) {
        groupedData[indexToSelect].isSelected = true
        groupedData[indexToSelect].backgroundColor = getNewColor()
      }

      //aranan kriterlere uygun ülke yok ise
      if (groupedData.length === 0) {
        setGroupByTitle(`Cannot Found Country..`)
      }

      setFilteredCountries(groupedData) //gruplama sonucu filtrelenmiş ülkeler
      setCurrentPage(1) //ilk sayfaya dönüş

      //arama ve gruplama yapıldıktan sonra yapılan işlemi açıklamak için. Örnek:Search & Group By: Tt & Continent 
      if(searchValue && groupValue && groupedData.length > 0){
        if (groupValue === 'continent' || groupValue === 'currency' || groupValue === 'language') {
            setGroupByTitle(`Search & Group By: ${searchValue.charAt(0).toLocaleUpperCase() + 
            searchValue.slice(1)} & ${groupValue.charAt(0).toLocaleUpperCase() + groupValue.slice(1)}`)
        } else {
            setGroupByTitle(`Search By: ${searchValue.charAt(0).toLocaleUpperCase() + searchValue.slice(1)}`)
        }
      
      } else if(searchValue && groupedData.length > 0) {
        setGroupByTitle(`Search By: ${searchValue.charAt(0).toLocaleUpperCase() + searchValue.slice(1)}`)
      } else if (groupValue && groupedData.length > 0) {
          if (groupValue === 'continent' || groupValue === 'currency' || groupValue === 'language') {
              setGroupByTitle(`Group By: ${groupValue.charAt(0).toLocaleUpperCase() + groupValue.slice(1)}`)
          } else {
            setGroupByTitle('')
          }
      }
    }  
  }

  //Clear butonu için filtreleri temizlemek ve sayfayı varsayılan duruma getirmek için fonksiyon
  const handleFilterClear = () => {
    //bütün seçimlerin kaldırılması
    const initialCountries = allCountries.map((country) => ({ 
      ...country, isSelected: false, backgroundColor: undefined
    }))
    setFilteredCountries(initialCountries) //seçimi kaldırılmış ülkelerin gösterilmesi
    setGroupByTitle('') //h2 başlığını temizle
    setCurrentPage(1) //1. sayfaya dön
  }

  //sayfa numarasının değiştirilmesi
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  //ülke seçimi veya seçilmiş ülkenin seçiminin kaldırılması
  const handleCountrySelected = (countryCode: string) => {
    const updatedCountries = filteredCountries.map((country) => {
      if (country.code === countryCode) {
        const newColor = getNewColor()
        return { ...country, isSelected: !country.isSelected, backgroundColor: newColor }
      }
      return country
    })
    setFilteredCountries(updatedCountries)
  }
  
  //renk elde etmek için
  const getNewColor = (): string => {
    const color = colorList[currentColorIndex]
    setCurrentColorIndex((prevIndex) => (prevIndex + 1) % colorList.length)
    return color
  }
  
  //arka plan için renk seçimi
  function getRandomColor (): string {
    const randomIndex = Math.floor(Math.random() * colorList.length)
    return colorList[randomIndex]
  }

  //arka plan renginin belirlenmesi
  function getBackgroundColor(country: Country, index: number): string {
    //ülke sayısı 10 veya fazla ise 10. ülke
    if (index === 9 && country.isSelected) {
      return country.backgroundColor || getRandomColor()
    }
    //ülke sayısı 10'dan az ise son ülke
    else if (index === (filteredData.length - 1) || country.isSelected) {
      return country.backgroundColor || getRandomColor()
    }
    if (country.isSelected && country.isSelected === true) {
      return country.backgroundColor || getRandomColor()
    }
    return 'transparent'
  }

  const paginationButtons = [] //sayfa numaraları için dizi
  const totalPages = Math.ceil(filteredCountries.length / pageSize) //toplam sayfa sayısının bulunması
  //sayfa numaralarının oluşturulması
  for (let i = 1; i <= totalPages; i++) {
    paginationButtons.push(
      <button key={i} className={currentPage === i ? 'active' : ''} onClick={() => handlePageChange(i)}>
        {i}
      </button>
    )
  }
  //kontroller
  if (loading) return <p>Loading...</p> //veriler yüklenmeye devam ediyor
  if (error) return <p>Error: {error.message}</p> //veriler yüklenirken hata oluştu

  //sayfa düzeni
  return (
    <div className='container'>
        {/*Ana Başlık*/}
      <h1>Country List</h1>
      {/*filtreleme bölümü*/}
      <Filter 
        onSearch={handleFilterSearch}
        onClear={handleFilterClear}
        />
        {/*filtreleme ve gruplamaya ait açıklama başlığı*/}
      <h2>{groupByTitle}</h2>
      {/*ülkelerin listelenmesi*/}
      <div className="country-grid">
        {getPaginatedCountries(currentPage).map((country: Country, index: number) => (
          <div 
            key={country.code} 
            className={`country-item ${country.isSelected ? 'selected' : ''}`}
            style={{ backgroundColor: getBackgroundColor(country, index) }}
            onClick={() => handleCountrySelected(country.code)}
          >
            <p className='country-name'><strong>{country.name.toUpperCase()}</strong></p>
            <p className='country-prop'><strong style={{textDecoration: 'underline'}}>Country Code:</strong> {country.code}</p>
            <p className='country-prop'><strong style={{textDecoration: 'underline'}}>Continent:</strong> {country.continent.name}</p>
            <p className='country-prop'><strong style={{textDecoration: 'underline'}}>Capital:</strong> {country.capital}</p>
            <p className='country-prop'><strong style={{textDecoration: 'underline'}}>Currency:</strong> {country.currency}</p>
            <p className='country-prop'><strong style={{textDecoration: 'underline'}}>Language:</strong> {country.languages.map((lang) => lang.name).join(', ')}</p>
          </div>
        ))}
      </div>
      {/*sayfalama bölümü*/}
      <div className="pagination">
        {paginationButtons}
      </div>
    </div>
  )
}

export default CountryList;