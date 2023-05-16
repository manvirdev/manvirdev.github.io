import moment from 'moment';
import Person from './Person';
import Patrol from './Patrol';
import Shift from './Shift';

export const processString = (str) => {
    try {
        let officers = [];
        let patrols = [];

        str = String(str);
        str = str.replace(/(?:\r\n|\r|\n)/g, ' ');
        str = str.replace(/\t+/gm, ' ');

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
        });
        
        if (patrols.length === 0) {
            throw new Error('No patrols found.');
        }
        
        return {patrols, officers};
    } catch (error) {
        throw new Error('Unable to generate report. Got this error: ' + error.message);
    }
}

export const generateShiftReport = async (officers, patrols) => {
    let shift = new Shift(new Person("Navdeep", "Kaur"), patrols[0].startTime, patrols[patrols.length - 1].endTime, officers, patrols);
    
    try {
      const report = await shift.generateReport();
      return report;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  };
  