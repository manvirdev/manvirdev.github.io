import React, { useState, useRef, useEffect } from 'react';
import { processString, generateShiftReport } from './../logic';
import InputSection from './InputSection';
import OutputSection from './OutputSection';
import polkaBackground from '../../design/polkabackground/PolkaBackground';
import AppGradient from '../../design/glowingparticles/AppGradient';
import moment from 'moment';

const Report = () => {
    const [shift, setShift] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [resultValue, setResultValue] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [formKey, setFormKey] = useState(0);

    const handleDataSubmit = async (data) => {
        console.log(data); // Handle or use the data as needed here
        try {
            const newShift = processString(data.inputValue, data.shiftType, data.briefingOfficers, data.breaks);
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

    useEffect(() => {
        document.title = 'Report - Do Not Use';

        // Apply the polkaBackground to the body
        for (const [key, value] of Object.entries(polkaBackground)) {
            document.body.style[key] = value;
        }

        // Cleanup: Reset the styles on unmount
        return () => {
            for (const key of Object.keys(polkaBackground)) {
                document.body.style[key] = null;
            }
        };
    }, []);

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
        <div className="container-fluid m-0 p-0">
            <div className="container" style={bodyStyles}>
                <div className="row p-0 m-0" style={{ 'zIndex': '999', minHeight: '5rem' }}>
                    <AppGradient />
                    <div className='display-5 text-light text-center'>
                        Report Writer
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm p-4 pl-5">
                        {/* Input section component call */}
                        <InputSection onSubmit={handleDataSubmit} availableTimeSlots ={availableTimeSlots} officers={officers}/>
                    </div>
                    <div className="col-sm p-4">
                        {/* Output section component call */}
                        <OutputSection resultValue={resultValue} showResults={showResults} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;
