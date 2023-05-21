import React, { useState, useRef, useEffect } from 'react';
import { processString, generateShiftReport } from './Logic';
import polkaBackground from '../design/polkabackground/PolkaBackground';
import AppGradient from '../design/glowingparticles/AppGradient';

const MyComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [showResults, setShowResults] = React.useState(false)
  const [resultValue, setResultValue] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [availableTimeSlots, setAvailableTimeSlots] = React.useState(null);

  const resultTextAreaRef = useRef(null);
  useEffect(() => {
    document.title = 'Report';
  }, []);


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


  const RenderAvailableTimeSlots = () => {
    console.log('Render Available Time: ' + availableTimeSlots);
    return (
      <div className="dropdown">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
        >
          Select a time slot
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          {availableTimeSlots.map((timeSlot, index) => (
            <a
              key={index}
              className="dropdown-item"
              href="#"
            >
              {`Start Time: ${timeSlot.startTime.format('HH:mm')} - End Time: ${timeSlot.endTime.format('HH:mm')}`}
            </a>
          ))}
        </div>
      </div>
    );
  };


  const handleSubmit = async () => {
    try {
      const shift = processString(inputValue, shiftType);
      const report = await generateShiftReport(shift);
      setResultValue(report);
      setShowResults(true);

      const timeSlots = shift.findAvailableTimeSlots();
      const availableSlots = shift.splitTimeSlots(timeSlots);
      setAvailableTimeSlots(availableSlots);
    } catch (error) {
      setResultValue(error.message);
      setShowResults(true);
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

  const OutputResultSection = () => {
    return (
      <div id='output'>
        <textarea
          id="result"
          style={{ minWidth: '500px', minHeight: '150px' }}
          value={resultValue}
          ref={resultTextAreaRef}
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
    );
  };


  const OutputWaitSection = () => {
    return (
      <div id='output display-5'>
        <p>Output will show up here</p>
      </div>
    );
  }

  const ShiftTypeSelector = () => {
    const handleShiftTypeChange = (event) => {
      setShiftType(event.target.value);
    };

    return (
      <div className="card card-sm" style={{ width: "10rem" }}>
        <div className="card-body">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="shiftType" id="morning" value="morning" checked={shiftType === 'morning'} onChange={handleShiftTypeChange} />
            <label className="form-check-label" htmlFor="morning">
              Morning
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="shiftType" id="evening" value="evening" checked={shiftType === 'evening'} onChange={handleShiftTypeChange} />
            <label className="form-check-label" htmlFor="evening">
              Evening
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="shiftType" id="graveyard" value="graveyard" checked={shiftType === 'graveyard'} onChange={handleShiftTypeChange} />
            <label className="form-check-label" htmlFor="graveyard">
              Graveyard
            </label>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="container-fluid" style={polkaBackground}>
      <div className="container" style={bodyStyles}>
        <div className="row p-0 m-0" style={{ 'zIndex': '999', minHeight: '10vh' }}>
          <AppGradient />
          <div className='display-5 text-light text-center'>
            Report Writer
          </div>
        </div>

        <div className="row">
          <div className="col-sm p-4">
            <div className="container-fluid p-0">
              <div className="display-5 white">Input</div>
            </div>
            <br />
            <textarea
              id="input"
              style={{ minWidth: '500px', minHeight: '150px', padding: '5px' }}
              value={inputValue}
              onChange={handleInputChange}
            ></textarea>
            <br />
            <div className="container-fluid p-0">
              <div className="text display-5">Shift Type</div>
            </div>
            <br />
            <ShiftTypeSelector />
            <br />
            {/* {(availableTimeSlots) ? <RenderAvailableTimeSlots /> : null} */}
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
            {showResults ? <OutputResultSection /> : <OutputWaitSection />}
          </div>
        </div>
      </div >
    </div >
  );
};

export default MyComponent;