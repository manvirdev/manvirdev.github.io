import React, { useState } from 'react';
import moment from 'moment';

const InputTextArea = ({ inputValue, handleInputChange }) => (
    <>
        <div className="container-fluid p-0">
            <div className="display-5 white">Input</div>
        </div>
        <textarea id="input" className={`m-2 ${window.innerWidth >= 992 ? 'w-75 h-50' : 'w-50 h-25'}`} value={inputValue} onChange={handleInputChange}></textarea>
    </>
);

const ShiftInfo = ({ shiftType, handleShiftTypeChange }) => (
    <>
        <div className="container-fluid p-0 mt-4">
            <div className="text display-5">Shift Info</div>
        </div>
        <div className="card card-sm w-25 m-2 ">
            <div className="card-body">
                <span className="h5">Timing</span>
                <hr className="mt-1 mb-2" />
                {["morning", "evening", "graveyard"].map(shift => (
                    <div key={shift} className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="shiftType"
                            id={shift}
                            value={shift}
                            checked={shiftType === shift}
                            onChange={handleShiftTypeChange}
                        />
                        <label className="form-check-label" htmlFor={shift}>
                            {shift.charAt(0).toUpperCase() + shift.slice(1)}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    </>
);

const BriefingOfficersTable = ({ rows, handleOfficerInputChange, handleAddRow, handleUpdateRow, handleDeleteRow }) => (
    <div className="card mt-2 card-sm w-75 m-2">
        <div className="card-body">
            <table className="table table-sm table-striped">
                <thead>
                    <tr>
                        <th className="h5" colSpan="3">Briefing Officers</th>
                    </tr>
                    <tr>
                        <th scope="col">First Name</th>
                        <th scope="col">Last Name</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={row.id}>
                            <td className='align-middle w-30'><input type="text" className="form-control" value={row.firstName} onChange={(e) => handleOfficerInputChange(e, rowIndex, 'firstName')} /></td>
                            <td className='align-middle w-30'><input type="text" className="form-control" value={row.lastName} onChange={(e) => handleOfficerInputChange(e, rowIndex, 'lastName')} /></td>
                            <td className='p-2  w-auto'>
                                {row.isAdded ? (
                                    <>
                                        <button className="btn btn-primary btn-sm m-1" onClick={() => handleUpdateRow(rowIndex)}>Update</button>
                                        <button className="btn btn-danger btn-sm m-1" onClick={() => handleDeleteRow(rowIndex)}>Delete</button>
                                    </>
                                ) : (
                                    rowIndex === rows.length - 1 && <button className="btn btn-primary btn-sm m-1" onClick={() => handleAddRow(rowIndex)}>Add</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const TimeSlotsAndOfficers = ({ availableTimeSlots, officers, currentBreaks, onAddBreak }) => {
    const [selectedOfficer, setSelectedOfficer] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

    const handleOfficerSelect = (e) => {
        setSelectedOfficer(JSON.parse(e.target.value));
    };

    const handleTimeSlotSelect = (e) => {
        setSelectedTimeSlot(e.target.value);
    };

    const filterOutTimeSlots = () => {
        const bookedSlots = currentBreaks.map(b => `${b.startTime.format('HH:mm')} - ${b.endTime.format('HH:mm')}`);
        return availableTimeSlots.filter(slot => !bookedSlots.includes(`${slot.startTime.format('HH:mm')} - ${slot.endTime.format('HH:mm')}`));
    };

    const filterOutOfficers = () => {
        const filteredOfficers = officers.filter((officer) => {
            const officerBreak = currentBreaks.find((breakTime) => {
                return officer.isSamePerson(breakTime.officer);
            });

            return !officerBreak;
        });

        return filteredOfficers;
    };

    const handleAddBreakButtonClick = () => {
        if (selectedOfficer && selectedTimeSlot) {
            const startTime = selectedTimeSlot.split('-')[0].trim();
            const endTime = selectedTimeSlot.split('-')[1].trim();
            const breakData = {
                officer: selectedOfficer,
                startTime: moment(startTime, 'HH:mm'),
                endTime: moment(endTime, 'HH:mm')
            };
            onAddBreak(breakData);
            setSelectedOfficer(null);
            setSelectedTimeSlot('');
        }
    };

    const filteredTimeSlots = filterOutTimeSlots();
    const filteredOfficers = filterOutOfficers(officers);

    return (
        <div className="card mt-2 card-sm w-50 m-2">
            <div className="card-body">
            <span className="h5">Breaks</span>
                <hr className="mt-1 mb-2" />
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
            <button className="btn btn-primary btn-sm" disabled={!selectedOfficer || !selectedTimeSlot} onClick={handleAddBreakButtonClick}>
                Add Break
            </button>
            </div>
        </div>
    );
};


const InputSection = ({ onSubmit, availableTimeSlots, officers }) => {
    const [inputValue, setInputValue] = useState('');
    const [shiftType, setShiftType] = useState('morning');
    const [rows, setRows] = useState([{ id: Date.now(), firstName: '', lastName: '', isAdded: false }]);
    const [breaks, setBreaks] = useState([]);

    const handleAddBreak = (breakData) => {
        setBreaks(prevBreaks => [...prevBreaks, breakData]);
    };

    const handleInputChange = (e) => setInputValue(e.target.value);

    const handleShiftTypeChange = (event) => setShiftType(event.target.value);

    const handleOfficerInputChange = (e, rowIndex, field) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex][field] = e.target.value;
        setRows(updatedRows);
    };

    const handleAddRow = (rowIndex) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex].isAdded = true;
        setRows([...updatedRows, { id: Date.now(), firstName: '', lastName: '', isAdded: false }]);
    };

    const handleUpdateRow = (rowIndex) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex].isAdded = true;
        setRows(updatedRows);
    };

    const handleDeleteRow = (rowIndex) => {
        const updatedRows = [...rows];
        updatedRows.splice(rowIndex, 1);
        setRows(updatedRows);
    };

    const handleSubmit = () => {
        // Gather all the data into an object
        const data = {
            inputValue,
            shiftType,
            briefingOfficers: rows.filter(row => row.isAdded),
            breaks
        };

        // Send it to the parent component
        onSubmit(data);
    };

    return (
        <>
            <InputTextArea inputValue={inputValue} handleInputChange={handleInputChange} />
            <ShiftInfo shiftType={shiftType} handleShiftTypeChange={handleShiftTypeChange} />
            <BriefingOfficersTable rows={rows} handleOfficerInputChange={handleOfficerInputChange} handleAddRow={handleAddRow} handleUpdateRow={handleUpdateRow} handleDeleteRow={handleDeleteRow} />
            {(availableTimeSlots.length > 0 && officers.length > 0) ?
                <TimeSlotsAndOfficers availableTimeSlots={availableTimeSlots} officers={officers} currentBreaks={breaks} onAddBreak={handleAddBreak} /> : null
            }
            <input className="btn btn-primary btn-sm mt-4" type="button" id="submit" value="SUBMIT" onClick={handleSubmit} />
        </>
    );
}

export default InputSection;