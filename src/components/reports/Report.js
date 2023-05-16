import React, { useState } from 'react';
import {processString, generateShiftReport } from './logic';

const MyComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [resultValue, setResultValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
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
  

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    minWidth: '100vh',
    padding: 0,
  };

  const bodyStyles = {
    backgroundImage:
      "url('https://images.unsplash.com/photo-1610661745998-3dd2afbdae0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1076&q=80')",
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    minWidth: '100%',
    minHeight: '100%',
    margin: 0,
    position: 'relative',
  };

  return (
    <div className="container-fluid" style={containerStyles}>
      <div className="container" style={bodyStyles}>
        <div className="row">
          <div className="col-sm">
            <div className="container-fluid">
              <div className="text-light display-5 white">Don't Use</div>
            </div>
            <br />
            <div className="container-fluid">
              <div className="text-light display-2 white">Input</div>
            </div>
            <br />
            <textarea
              id="input"
              style={{ minWidth: '500px', minHeight: '150px' }}
              value={inputValue}
              onChange={handleInputChange}
            ></textarea>
            <br />
            <input
              className="btn btn-primary"
              type="button"
              id="submit"
              value="SUBMIT"
              onClick={handleSubmit}
            />
            <br />
            <br />
            <div className="container-fluid">
              <div className="text-light display-2 white">Output</div>
            </div>
            <br />
            <textarea
              id="result"
              style={{ minWidth: '500px', minHeight: '150px' }}
              value={resultValue}
              readOnly
            ></textarea>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default MyComponent;
