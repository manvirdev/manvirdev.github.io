import React, { useState } from 'react';

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


const InputSection = ({ onSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const [shiftType, setShiftType] = useState('morning');
    const [rows, setRows] = useState([{ id: Date.now(), firstName: '', lastName: '', isAdded: false }]);

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
            briefingOfficers: rows.filter(row => row.isAdded)
        };

        // Send it to the parent component
        onSubmit(data);
    };

    return (
        <>
            <InputTextArea inputValue={inputValue} handleInputChange={handleInputChange} />
            <ShiftInfo shiftType={shiftType} handleShiftTypeChange={handleShiftTypeChange} />
            <BriefingOfficersTable rows={rows} handleOfficerInputChange={handleOfficerInputChange} handleAddRow={handleAddRow} handleUpdateRow={handleUpdateRow} handleDeleteRow={handleDeleteRow} />
            <input className="btn btn-primary btn-sm mt-4" type="button" id="submit" value="SUBMIT" onClick={handleSubmit} />
        </>
    );
}

export default InputSection;