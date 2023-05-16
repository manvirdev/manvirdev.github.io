import React, { useEffect, useState } from 'react';
import Shift from './reports/Shift';
import Patrol from './reports/Patrol';
import Person from './reports/Person';
import moment from 'moment';

const MyComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const [resultValue, setResultValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    strProcessor(inputValue);
  };

  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':');
    return 60 * parseInt(hours, 10) + parseInt(minutes, 10);
  }

  const strProcessor = (str) => {
    let officers = [];
    let patrols = [];

    str = String(str);
    
    str = str.replace(/(?:\r\n|\r|\n)/g, ' ');
    str = str.replace(/\t+/gm, ' ')

    str = str.trim();

    const arr = str.split(' View Tour Session + ').reverse();

    arr.forEach((ele) => {
      ele = ele.replace('+ S - M232 - Colliers - Exchange Building  + ', '');

      const patrolType = ele.match(/^([\w\/\-]+)/)[0];

      ele = ele.replace(/^([\w\/\-]+)/, '');
      ele = ele.replace(/\sPatrol\s/, '');

      const officerFirstName = ele.match(/\w+\s+/)[0].trim();
      ele = ele.replace(/\w+\s+/, '');

      // Last name in all caps
      const officerLastName = ele.match(/\w+/)[0].toUpperCase();
      ele = ele.replace(/\w+/, '');

      const officer = new Person(officerFirstName, officerLastName);

      const exists = officers.some(ele => ele.isSamePerson(officer));

      if (!exists) {
        officers.push(officer);
      }

      let backupOfficer = officers.find((o) => !o.isSamePerson(officer));

      const startTime = moment(ele.match(/\d+:\d+/)[0], 'HH:mm');
      const endTime = moment(ele.match(/\d+:\d+/g)[1], 'HH:mm');

      let patrol = new Patrol(patrolType, officer, backupOfficer, startTime, endTime);
      
      patrols.push(patrol);

      let shift = new Shift(new Person("test", "test"), patrols[0].startTime, patrols[patrols.length - 1].endTime, officers, patrols);
      
      setResultValue(shift.generateReport());
    })
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
