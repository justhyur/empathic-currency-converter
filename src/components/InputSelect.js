import React, { useState, useEffect, useRef } from 'react'
import { LightenDarkenColor } from 'lighten-darken-color'; 
import './InputSelect.scss'

function InputSelect({name, value, setValue, options, color}){

    const updateInputValue = () => {
        const newOption = getOption('value', value);
        setInputValue(newOption? newOption.label : options[0].label);
    }

    const getOption = (key, value) => {
        for(const option of options){
            if(option[key] === value){
                return option;
            }
        }
    }

    const mainOption = getOption('value', value);
    const [ inputValue, setInputValue ] = useState(mainOption? mainOption.label : options[0].label);
    const [ showList, setShowList ] = useState(false);

    useEffect(()=>{
        updateInputValue();
    },[value])

    return (<>
        <div className="input-select">
            <input
                value={inputValue}
                onChange={(e)=>{
                    setInputValue(e.target.value);
                    const currentValue = e.target.value.toLowerCase();
                    for(const option of options){
                        if(option.label.toLowerCase() === currentValue){
                            setInputValue(option.label);
                            setValue(option.value);
                        }
                    }
                }}
                onFocus={()=>{setShowList(true);}}
                onBlur={()=>{
                    setShowList(false);
                    updateInputValue();
                }}
            >
            </input>
            {showList &&
                <div className="select-list" style={{backgroundColor: color}}>
                    {options.map((option,index) => {
                        let showOption = true;
                        for(let i=0; i<inputValue.length; i++){
                            if(option.label[i] && option.label[i].toLowerCase() !== inputValue[i].toLowerCase()){
                                showOption = false;
                            }
                        }
                        if(showOption)
                        return(
                            <div 
                                key={name+index}
                                className="option"
                                onMouseEnter={(e)=>{
                                    e.target.style.backgroundColor = LightenDarkenColor(color, -20);
                                }}
                                onMouseLeave={(e)=>{
                                    e.target.style.backgroundColor = color;
                                }}
                                onMouseDown={()=>{
                                    setInputValue(option.label);
                                    setValue(option.value);
                                }}
                            >{option.label}</div>
                        )
                    })
                    }
                </div>
            }
        </div>
    </>
    )
}

export default InputSelect;

InputSelect.defaultProps = {
    color: '#ffffff'
}