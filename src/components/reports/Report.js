import React, { useState, useRef } from 'react';
import { processString, generateShiftReport } from './Logic';
import polkaBackground from '../design/polkabackground/PolkaBackground';
import AppGradient from '../design/glowingparticles/AppGradient';

const MyComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [resultValue, setResultValue] = useState('');
  const resultTextAreaRef = useRef(null);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const addToClipboard = () => {
    if (resultTextAreaRef.current) {
      resultTextAreaRef.current.select();
      resultTextAreaRef.current.setSelectionRange(0, 99999);
      document.execCommand('copy');
    }
  };
  
  const handleSubmit = async () => {
    try {
      const { officers, patrols } = processString(inputValue);
      const report = await generateShiftReport(officers, patrols)
      setResultValue(report);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

const bodyStyles = {
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    minWidth: '100%',
    minHeight: '100%',
    margin: 0,
    padding: 0,
  };

  return (
    <div className="container-fluid" style={polkaBackground}>
      <div className="container" style={bodyStyles}>
        <div className="row p-0 m-0" style={{'zIndex': '999', minHeight: '10vh'}}>
          <AppGradient />
          <div className='display-5 text-light text-center'>
          Report Writer
          </div>
        </div>

        <div className="row">
          <div className="col-sm p-4">
            <div className="container-fluid p-0">
              <div className="display-4 white">Input</div>
            </div>
            <br />
            <textarea
              id="input"
              style={{ minWidth: '500px', minHeight: '150px', padding: '5px' }}
              value={inputValue}
              onChange={handleInputChange}
          
            ></textarea>
            <br />
            <input
              className="btn btn-primary btn-sm"
              type="button"
              id="submit"
              value="SUBMIT"
              onClick={handleSubmit}
            />
            </div>
         <div className="col-sm p-4">
            <div className="container-fluid p-0">
              <div className="display-4 white">Output</div>
            </div>
            <br />
            <textarea
              id="result"
              style={{ minWidth: '500px', minHeight: '150px' }}
              value={resultValue}
              ref={resultTextAreaRef}
              readOnly
            ></textarea>
            <br />
            <input
              className="btn btn-info btn-sm"
              type="button"
              id="copy"
              value="COPY"
              onClick={addToClipboard}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyComponent;
