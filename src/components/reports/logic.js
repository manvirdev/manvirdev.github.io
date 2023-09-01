import moment from 'moment';
import Person from './Person';
import Patrol from './Patrol';
import Shift from './Shift';
import Break from './Break';

export const processString = (str, shiftType, briefingOfficersInput, breaksInput) => {
    try {
        let shift;
        let officers = [];
        let patrols = [];
        let briefingOfficers = [];
        let breaks = [];

        str = String(str);
        str = str.replace(/(?:\r\n|\r|\n)/g, ' ');
        str = str.replace(/\t+/gm, ' ');

        str = str.trim();
        let shiftStartTime, shiftEndTime;
        const arr = str.split(' View Tour Session + ').reverse();
        if (shiftType === 'morning') {
            shiftStartTime = moment('08:00', 'HH:mm');
            shiftEndTime = moment('16:00', 'HH:mm');
        } else if (shiftType === 'evening') {
            shiftStartTime = moment('16:00', 'HH:mm');
            shiftEndTime = moment('24:00', 'HH:mm');
        } else if (shiftType === 'graveyard') {
            shiftStartTime = moment('00:00', 'HH:mm');
            shiftEndTime = moment('08:00', 'HH:mm');
        }

        briefingOfficersInput.forEach((ele) => {
            // Extract firstName and lastName from the input
            const { firstName, lastName } = ele;

            // Create a new Person object
            const officer = new Person(firstName, lastName);

            // Add this new officer to the briefingOfficer array
            briefingOfficers.push(officer);
        });

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

            const exists = officers.some((ele) => ele.isSamePerson(officer));

            if (!exists) {
                officers.push(officer);
            }

            let backupOfficer = officers.find((o) => !o.isSamePerson(officer));

            const startTime = moment(ele.match(/\d+:\d+/)[0], 'HH:mm');
            const endTime = moment(ele.match(/\d+:\d+/g)[1], 'HH:mm');

            let patrol = new Patrol(patrolType, officer, backupOfficer, startTime, endTime);
            if(moment.duration(endTime.diff(startTime)).asMinutes() > 2) 
            patrols.push(patrol);
        });

        if (patrols.length === 0) {
            throw new Error('No patrols found.');
        }
        breaksInput.forEach((breakData) => {
            const { officer, startTime, endTime } = breakData;

            // Find or create the officer involved in the break

            const breakStartTime = moment(startTime, 'HH:mm');
            const breakEndTime = moment(endTime, 'HH:mm');
            const breakObj = new Break(officer, breakStartTime, breakEndTime);

            breaks.push(breakObj);
        });
        shift = new Shift(briefingOfficers, shiftStartTime, shiftEndTime, officers, patrols, shiftType, breaks);
        console.log("In the logic.js file, the shift object is:", shift);

        return shift;
    } catch (error) {
        throw new Error('Unable to generate report. Got this error: ' + error.message);
    }
};

export const generateShiftReport = async (shift) => {
    try {
        if (!shift) {
            throw new Error('Shift not initialized. Please call processString() first.');
        }
        const report = await shift.generateReport();
        return report;
    } catch (error) {
        console.error("Error generating report:", error);
        throw error;
    }
};