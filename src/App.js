import React, { useEffect, useState, useRef } from 'react';
import './App.scss';
import countriesData from './countries_data.json';
import InputSelect from './components/InputSelect'

function App() {

  

  const baseCurrency = 'EUR';

  const getStorage = (key) => {
    return JSON.parse(localStorage.getItem(key))
  }
  const setStorage = (key, obj) => {
    localStorage.setItem(key, JSON.stringify(obj));
  }
  const setStorageDate = (key, obj) => {
    const data = {obj, date:Date.now()}
    localStorage.setItem(key, JSON.stringify(data));
  }

  const [ isOnline, setIsOnline ] = useState(window.navigator.onLine);
  // const [ apiKey, setApiKey ] = useState(null);

  const [ conversionRates, setConversionRates ] = useState(getStorage('conversionRates'));
  
  const [ countryFrom, setCountryFrom ] = useState(getStorage('countryFrom'));
  
  const [ countryTo, setCountryTo ] = useState(getStorage('countryTo'));

  const [ inputValue, setInputValue ] = useState(1);

  const [ currencyFrom, setCurrencyFrom ] = useState(getStorage('currencyFrom'));
  const [ currencyTo, setCurrencyTo ] = useState(getStorage('currencyTo'));

  const inputRef = useRef(null);
  

  useEffect(()=>{
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    // loadUserCountry();
    loadConversionRates();
    // console.log(countriesData)
  },[]);

  useEffect(()=>{
    setStorage('currencyFrom', currencyFrom);
  },[currencyFrom])
  
  useEffect(()=>{
    setStorage('currencyTo', currencyTo);
  },[currencyTo])

  useEffect(()=>{
    setStorage('countryFrom', countryFrom);
  },[countryFrom])
  
  useEffect(()=>{
    setStorage('countryTo', countryTo);
  },[countryTo])

  useEffect(()=>{
  }, [inputValue])

 
  const loadUserCountry = () => {
    const url = process.env.REACT_APP_IP_URL;
    const api = process.env.REACT_APP_IP_API;
    fetch(`${url}?apiKey=${api}`)
    .then(response=>{
      response.json()
      .then(json=>{
        const countryCode = json.country_code2;
        if(getStorage('countryTo') === null){
          setCurrencyTo(countryCode);
          setStorage('countryTo', countryCode);
        }
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
          setStorageDate('conversionRates', sortedJson);
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
      if(timePassedSinceLastFetch < 3600){
        setTimeout(()=>{
          console.log(`Time passed since last fetch is less than one hour. (${Math.floor(timePassedSinceLastFetch)} seconds)`);
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

  const getFeelValue = (inputValue, currencyFrom, countryFrom, countryTo) => {
    if(!isNaN(inputValue) && conversionRates && conversionRates.obj && conversionRates.obj[currencyFrom]){
      const eurValue = inputValue / conversionRates.obj[currencyFrom].value;
      const from = countriesData.filter(data=>data.code === countryFrom)[0];
      const to = countriesData.filter(data=>data.code === countryTo)[0];
      if(!from || !to){return null}
      const fromSalary = from? from.data["Salaries And Financing"]["Average Monthly Net Salary (After Tax)"] : null;
      const toSalary = to? to.data["Salaries And Financing"]["Average Monthly Net Salary (After Tax)"] : null;
      if(fromSalary === null || toSalary === null){return null}
      return eurValue * toSalary / fromSalary;
    }else{return null}
  }

  const convertClassic = (value, from, to) => {
    if(conversionRates.obj[from] && conversionRates.obj[to]){
      const eurValue = value / conversionRates.obj[from].value;
      return eurValue * conversionRates.obj[to].value;
    }else{
      return 0;
    }
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
                <div className="input-container" style={{width: "100px"}}>
                  <InputSelect
                    name="currencyFrom"
                    value={currencyFrom}
                    setValue={setCurrencyFrom}
                    options={Object.keys(conversionRates.obj).map(key=>({value:key, label:key}))}
                  />
                </div>
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
              <div className="input-container" style={{width: "100px"}}>
                  <InputSelect
                    name="currencyTo"
                    value={currencyTo}
                    setValue={setCurrencyTo}
                    options={Object.keys(conversionRates.obj).map(key=>({value:key, label:key}))}
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="feeler">
            <span>Someone from</span>
            <InputSelect 
              name="countryFrom"
              value={countryFrom}
              setValue={setCountryFrom}
              options={countriesData.map(country=>({value:country.code, label:country.name}))}
            />
            <span>would feel</span>
            <strong>{parseFloat(inputValue).toFixed(2)} {currencyFrom}</strong>
            <span>like someone from</span>
            <InputSelect 
              name="countryTo"
              value={countryTo}
              setValue={setCountryTo}
              options={countriesData.map(country=>({value:country.code, label:country.name}))}
            />
            <span>would feel</span>
            <strong>
              {getFeelValue(inputValue, currencyFrom, countryFrom, countryTo) !== null?
                `${parseFloat(getFeelValue(inputValue, currencyFrom, countryFrom, countryTo)).toFixed(2)} ${currencyFrom}`
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
