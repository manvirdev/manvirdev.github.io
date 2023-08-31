import React, { useState, useRef, useEffect } from 'react';
import { processString, generateShiftReport } from './logic';
import polkaBackground from '../design/polkabackground/PolkaBackground';
import AppGradient from '../design/glowingparticles/AppGradient';
import moment from 'moment';
const ShiftForm = ({ officers, availableTimeSlots, selectedOfficer, handleOfficerSelect, selectedTimeSlot, handleTimeSlotSelect, handleAddBreak, shift }) => {
  const filterOutTimeSlots = (availableTimeSlots) => {
    const filteredSlots = availableTimeSlots.filter((slot) => {
      const slotUsed = shift.breaks.some((breakTime) => {
        return (
          breakTime.startTime.format('HH:mm') === slot.startTime.format('HH:mm') &&
          breakTime.endTime.format('HH:mm') === slot.endTime.format('HH:mm')
        );
      });

      return !slotUsed;
    });

    return filteredSlots;
  };

  const filterOutOfficers = (officers) => {
    const filteredOfficers = officers.filter((officer) => {
      const officerBreak = shift.breaks.find((breakTime) => {
        return officer.isSamePerson(breakTime.officer);
      });

      return !officerBreak;
    });

    return filteredOfficers;
  };

  const filteredOfficers = filterOutOfficers(officers);
  const filteredTimeSlots = filterOutTimeSlots(availableTimeSlots);

  return (
    <div >
      <div>
        <label htmlFor="officerSelect" className='blockquote form-label p-1'>Select Officer </label>
        <select id="officerSelect" value={JSON.stringify(selectedOfficer)} onChange={handleOfficerSelect}>
          <option value="">Select an Officer</option>
          {filteredOfficers.map((officer, index) => (
            <option key={index} value={JSON.stringify(officer)}>
              {officer.firstName + ' ' + officer.lastName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="timeSlotSelect" className='blockquote form-label p-1'>Select Time Slot </label>
        <select id="timeSlotSelect" value={selectedTimeSlot} onChange={handleTimeSlotSelect}>
          <option value="">Select a Time Slot</option>
          {filteredTimeSlots.map((slot, index) => (
            <option key={index} value={`${slot.startTime.format('HH:mm')} - ${slot.endTime.format('HH:mm')}`}>
              {`${slot.startTime.format('HH:mm')} - ${slot.endTime.format('HH:mm')}`}
            </option>
          ))}
        </select>
      </div>
      <button className="btn btn-primary btn-sm" disabled={!selectedOfficer || !selectedTimeSlot} onClick={handleAddBreak}>
        Add Break
      </button>
    </div>
  );
};

const MyComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [showResults, setShowResults] = React.useState(false)
  const [resultValue, setResultValue] = useState('');
  const [shiftType, setShiftType] = useState('morning');
  const [availableTimeSlots, setAvailableTimeSlots] = React.useState(null);
  const [officers, setOfficers] = useState([]);
  const [briefingOfficers, setBriefingOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [shift, setShift] = useState(null);
  const resultTextAreaRef = useRef(null);
  const [formKey, setFormKey] = useState(0);

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

  const handleOfficerSelect = (event) => {
    setSelectedOfficer(JSON.parse(event.target.value));
  };

  const handleTimeSlotSelect = (event) => {
    setSelectedTimeSlot(event.target.value);
  };

  const handleAddBreak = async () => {
    if (selectedOfficer && selectedTimeSlot) {

      const startTime = selectedTimeSlot.split('-')[0].trim();
      const endTime = selectedTimeSlot.split('-')[1].trim();
      const breakTime = {
        officer: selectedOfficer,
        startTime: moment(startTime, 'HH:mm'),
        endTime: moment(endTime, 'HH:mm'),
      };
      shift.addBreak(breakTime);
      const report = await generateShiftReport(shift);
      setResultValue(report);
      setShowResults(true);

      const timeSlots = shift.findAvailableTimeSlots();
      const availableSlots = shift.splitTimeSlots(timeSlots);
      setAvailableTimeSlots(availableSlots);
      setSelectedOfficer('');
      setSelectedTimeSlot('');

    }
  };

  const handleClear = () => {
    setInputValue('');
    setShowResults(false);
    setResultValue('');
    setSelectedOfficer('');
    setSelectedTimeSlot('');
    setAvailableTimeSlots(null);
    setOfficers([]);
    setShift(null);
  };

  const handleSubmit = async () => {
    try {
      const newShift = processString(inputValue, shiftType);
      setShift(newShift);

      const report = await generateShiftReport(newShift);
      setResultValue(report);
      setShowResults(true);

      const timeSlots = newShift.findAvailableTimeSlots();
      console.log(timeSlots);
      const availableSlots = newShift.splitTimeSlots(timeSlots);
      setAvailableTimeSlots(availableSlots);
      console.log(availableSlots.length);

      const officersList = newShift.officers;
      setOfficers(officersList);
      setFormKey((prevKey) => prevKey + 1);
    } catch (error) {
      setResultValue(error.message);
      setShowResults(true);
      setFormKey((prevKey) => prevKey + 1);
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
          style={{
            minWidth: window.innerWidth >= 992 ? '500px' : '300px',
            minHeight: window.innerWidth >= 992 ? '500px' : '150px',
            padding: '5px',
          }}
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

  const handleUpdateBriefingOfficers = (newBriefingOfficers) => {
    setBriefingOfficers(...briefingOfficers, newBriefingOfficers);
  };

  const ShiftInfoForm = ({ onUpdateBriefingOfficers }) => {
    const [rows, setRows] = useState([{ firstName: '', lastName: '' }]);
    const [briefingOfficers, setBriefingOfficers] = useState([]);
  
    const handleShiftTypeChange = (event) => {
      setShiftType(event.target.value);
    };
  
    const handleInputChange = (event, rowIndex, field) => {
      const newRows = [...rows];
      newRows[rowIndex][field] = event.target.value;
      setRows(newRows);
    };
    const handleAddRow = (rowIndex) => {
      const newBriefingOfficers = [...briefingOfficers, rows[rowIndex]];
      setBriefingOfficers(newBriefingOfficers);
      const newRows = [...rows];
      newRows[rowIndex].isAdded = true;
      setRows([...newRows, { firstName: '', lastName: '' }]); // Add a new empty row
  
      // Call the function passed in via props.
      onUpdateBriefingOfficers(newBriefingOfficers);
    };
  
    const handleDeleteRow = (rowIndex) => {
      const newBriefingOfficers = briefingOfficers.filter((_, index) => index !== rowIndex);
      setBriefingOfficers(newBriefingOfficers);
      const newRows = [...rows];
      newRows.splice(rowIndex, 1);
      setRows(newRows);
  
      // Call the function passed in via props.
      onUpdateBriefingOfficers(newBriefingOfficers);
    };


    return (
      <div>
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
        <div className="card card-sm" style={{ width: "25rem" }}>
          <div className="card-body">
            <table className="table table-sm table-striped">
              <thead>
                <tr colspan="3">
                  Briefing Officers
                </tr>
                <tr>
                  <th scope="col">First Name</th>
                  <th scope="col">Last Name</th>
                  <th scope="col">Action</th> {/* Header for add/delete buttons */}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td><input type="text" className="form-control" value={row.firstName} onChange={(e) => handleInputChange(e, rowIndex, 'firstName')} disabled={row.isAdded} /></td>
                    <td><input type="text" className="form-control" value={row.lastName} onChange={(e) => handleInputChange(e, rowIndex, 'lastName')} disabled={row.isAdded} /></td>
                    <td>
                      {!row.isAdded && <button className="btn btn-primary btn-sm" onClick={() => handleAddRow(rowIndex)}>Add</button>}
                      { rows.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRow(rowIndex)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="container-fluid" style={polkaBackground}>
      <div className="container" style={bodyStyles}>
        <div className="row p-0 m-0" style={{ 'zIndex': '999', minHeight: '5rem' }}>
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
              style={{
                minWidth: window.innerWidth >= 992 ? '500px' : '300px',
                minHeight: '150px',
                padding: '5px',
              }}
              value={inputValue}
              onChange={handleInputChange}
            ></textarea>
            <br />
            <div className="container-fluid p-0">
              <div className="text display-5">Shift Info</div>
            </div>
            <br />
            <ShiftInfoForm onUpdateBriefingOfficers={handleUpdateBriefingOfficers} />
            {(availableTimeSlots) ?
              <ShiftForm
                key={formKey}
                officers={officers}
                availableTimeSlots={availableTimeSlots}
                selectedOfficer={selectedOfficer}
                handleOfficerSelect={handleOfficerSelect}
                selectedTimeSlot={selectedTimeSlot}
                handleTimeSlotSelect={handleTimeSlotSelect}
                handleAddBreak={handleAddBreak}
                shift={shift}
              /> : null
            }
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