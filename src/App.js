import React, { useEffect, useState, useRef } from 'react';
import './App.scss';
import countriesData from './countries_data.json'

function App() {

  const baseCurrency = 'EUR';

  const getStorage = (key) => {
    return JSON.parse(localStorage.getItem(key))
  }
  const setStorage = (key, obj) => {
    const data = {obj, date:Date.now()}
    localStorage.setItem(key, JSON.stringify(data));
  }

  const [ isOnline, setIsOnline ] = useState(window.navigator.onLine);
  // const [ apiKey, setApiKey ] = useState(null);

  const [ userCountry, setUserCountry ] = useState('');
  const [ conversionRates, setConversionRates ] = useState(getStorage('conversionRates'));
  
  const [ countryFrom, setCountryFrom ] = useState('');
  const [ imageFrom, setImageFrom ] = useState('');
  const [ countryTo, setCountryTo ] = useState('');
  const [ imageTo, setImageTo ] = useState('');
  const [ inputValue, setInputValue ] = useState(1);

  const [ currencyFrom, setCurrencyFrom ] = useState('EUR');
  const [ currencyTo, setCurrencyTo ] = useState('TRY');

  const inputRef = useRef(null);
  

  useEffect(()=>{
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    loadUserCountry();
    loadConversionRates();
  },[]);

  useEffect(()=>{
    setCountryTo(userCountry);
  },[userCountry])

  useEffect(()=>{
    fetch(`https://countryflagsapi.com/svg/${countryFrom.toLowerCase()}`)
    .then(response=>{
      response.blob()
      .then(blob=>{
        const reader = new FileReader();
        reader.onload = () => {
          setImageFrom(reader.result)
        };
        reader.readAsDataURL(blob);
      })
    })
  },[countryFrom])

  useEffect(()=>{
    fetch(`https://countryflagsapi.com/svg/${countryTo.toLowerCase()}`)
    .then(response=>{
      response.blob()
      .then(blob=>{
        const reader = new FileReader();
        reader.onload = () => {
          setImageTo(reader.result)
        };
        reader.readAsDataURL(blob);
      })
    })
  },[countryTo])

 
  const loadUserCountry = () => {
    const url = process.env.REACT_APP_IP_URL;
    const api = process.env.REACT_APP_IP_API;
    fetch(`${url}?apiKey=${api}`)
    .then(response=>{
      response.json()
      .then(json=>{
        setUserCountry(json.country_name);
      })
    })
    // setUserCountry('Italy');
  }
  
  const fetchConversionRates = () => {
    console.log("fetched");
    if(isOnline){
      const url = process.env.REACT_APP_CURRENCY_URL;
      const api = process.env.REACT_APP_CURRENCY_API;
      fetch(`${url}?apikey=${api}&base_currency=${baseCurrency}`)
      .then( response => response.json()).catch(err => {console.error(err); setConversionRates(getStorage('conversionRates'));})
      .then( json => {
        if(json){
          const sortedJson = sortObject(json.data);
          setStorage('conversionRates', sortedJson);
          setConversionRates(getStorage('conversionRates'));
        }
      })
    }else{
      setConversionRates(getStorage('conversionRates'));
    }
  }

  const loadConversionRates = () => {
    setConversionRates(null);
    const convRates = getStorage('conversionRates');
    if(convRates){
      const now = Date.now();
      const timePassedSinceLastFetch = (now - convRates.date) / 1000;
      console.log(timePassedSinceLastFetch)
      if(timePassedSinceLastFetch < 60){
        setTimeout(()=>{
          console.log(`Time passed since last fetch is less than a minute. (${Math.floor(timePassedSinceLastFetch)} seconds)`);
          setConversionRates(convRates);
        },250)
        return;
      } else{ 
        setTimeout(()=>{
          fetchConversionRates(); 
        },250);
      }
    } else{ 
      setTimeout(()=>{
        fetchConversionRates(); 
      },250);
    }
  }

  const getFeelValue = () => {
    if(!isNaN(inputValue)){
      const eurValue = inputValue / conversionRates.obj[currencyFrom];
      const from = countriesData.filter(data=>data.country === countryFrom)[0];
      const to = countriesData.filter(data=>data.country === countryTo)[0];
      if(!from || !to){return null}
      const fromSalary = from? from.data["Salaries And Financing"]["Average Monthly Net Salary (After Tax)"] : null;
      const toSalary = to? to.data["Salaries And Financing"]["Average Monthly Net Salary (After Tax)"] : null;
      if(fromSalary === null || toSalary === null){return null}
      return eurValue * toSalary / fromSalary;
    }else{return null}
  }

  const convertClassic = (value, from, to) => {
    const eurValue = value / conversionRates.obj[from];
    return eurValue * conversionRates.obj[to];
  }

  const switchCurrencies = () => {
    const temp = currencyFrom;
    setCurrencyFrom(currencyTo);
    setCurrencyTo(temp);
  }

  const switchCountries = () => {
    const temp = countryFrom;
    setCountryFrom(countryTo);
    setCountryTo(temp);
  }

  const sortObject = obj => Object.keys(obj).sort().reduce((res, key) => (res[key] = obj[key], res), {});

  return (
    <div className="app">

      <header>
        <div></div>
        <h1>Empathic<br/>Currency Converter</h1>
      </header>

      {conversionRates && conversionRates.obj &&
        <main>

          <section id="converter">
            <div id="from">
              <div className="block1">
                <input ref={inputRef} type="number" value={inputValue} inputMode="decimal" 
                    onChange={(e)=>{setInputValue(e.target.value)}}
                    onKeyUp={(e)=>{if(e.key === "Enter"){inputRef.current.blur()}}}
                ></input>
              </div>
              <div className="block2">
                <select value={currencyFrom} onChange={(e)=>{setCurrencyFrom(e.target.value)}}>
                  {Object.keys(conversionRates.obj).map((currency, index)=>(
                      <option key={`currencyFrom${index}`} value={currency}>{currency}</option>
                    ))}
                </select>
              </div>
            </div>
            <div id="equal">
              <div className="block1">
                =
              </div>
              <div className="block2">
                <div>
                  <button className="switcher" onClick={switchCurrencies}>🔄</button>
                </div>
              </div>
            </div>
            <div id="to">
              <div className="block1">
                <strong>{inputValue? parseFloat(convertClassic(inputValue, currencyFrom, currencyTo)).toFixed(2) : ''}</strong>
              </div>
              <div className="block2">
                <select value={currencyTo} onChange={(e)=>{setCurrencyTo(e.target.value)}}>
                  {Object.keys(conversionRates.obj).map((currency, index)=>(
                      <option key={`currencyTo${index}`} value={currency}>{currency}</option>
                    ))}
                </select>
              </div>
            </div>
          </section>

          <section id="feeler">
            <span>Someone from</span>
            <select 
              style={{backgroundImage: `url('${imageFrom}')`}} 
              value={countryFrom} onChange={(e)=>{setCountryFrom(e.target.value)}}>
                <option value=""></option>
              {countriesData.map((country, index)=>(
                <option key={`countryFrom${index}`} value={country.country}>{country.country}</option>
              ))}
            </select>
            <span>would feel</span>
            <strong>{parseFloat(inputValue).toFixed(2)} {currencyFrom}</strong>
            <span>like someone from</span>
            <select 
              style={{backgroundImage: `url('${imageTo}')`}} 
              value={countryTo} onChange={(e)=>{setCountryTo(e.target.value)}}>
                <option value=""></option>
              {countriesData.map((country, index)=>(
                <option key={`countryFrom${index}`} value={country.country}>{country.country}</option>
                ))}
            </select>
            <span>would feel</span>
            <strong>
              {getFeelValue() !== null?
                `${parseFloat(getFeelValue()).toFixed(2)} ${currencyFrom}`
              :
                '...'
              }
            </strong>
            <div>
              <button className="switcher" onClick={switchCountries}>🔃</button>
            </div>
          </section>

        </main>
      }

    </div>
  );
}

export default App;
