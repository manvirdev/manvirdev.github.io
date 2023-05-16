// Shift.js
import moment from "moment";

class Shift {
    constructor(briefingOfficer, startTime, endTime, officers, patrols) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.briefingOfficer = briefingOfficer;
        this.officers = officers;
        this.patrols = patrols;
    }

 generateReport() {
  const report = [];

  this.patrols.forEach((patrol) => {
    const timeDiff = this.calculateTimeDifference(patrol);
    const { status, additionalLine } = this.getStatusAndAdditionalLine(patrol, timeDiff);
    const patrolString = this.getPatrolString(patrol, status, additionalLine);

    report.push(patrolString);
  });

  return report.join('');
}

calculateTimeDifference(patrol) {
  const duration = moment.duration(patrol.endTime.diff(patrol.startTime));
  const hours = duration.hours();
  const minutes = duration.minutes();
  return hours * 60 + minutes;
}

getStatusAndAdditionalLine(patrol, timeDiff) {
  let status;
  let additionalLine = '';
  const cctvStartTime = patrol.startTime.clone().add(5, 'minutes');
  const backupOfficer = this.officers.find((officer) => !officer.isSamePerson(patrol.officer));

  if (timeDiff < 30) {
    status = 'completed quickly';
  } else if (timeDiff < 60) {
    status = 'completed within an hour';
    if (backupOfficer != null) {
      additionalLine = `${cctvStartTime.format('HH:mm')}: S/O ${backupOfficer.firstName} ${backupOfficer.lastName.toUpperCase()} watching CCTV cameras.\n`;
    }
  } else {
    status = 'completed in a longer duration';
    if (backupOfficer != null) {
      additionalLine = `${cctvStartTime.format('HH:mm')}: S/O ${backupOfficer.firstName} ${backupOfficer.lastName.toUpperCase()} watching CCTV cameras.\n`;
    }
  }

  return { status, additionalLine };
}

getPatrolString(patrol, status, additionalLine) {
  const startString = `${patrol.startTime.format('HH:mm')}: S/O ${patrol.officer.firstName} ${patrol.officer.lastName.toUpperCase()} started the ${patrol.type} patrol.\n`;
  const endString = `${patrol.endTime.format('HH:mm')}: S/O ${patrol.officer.firstName} ${patrol.officer.lastName.toUpperCase()} completed the ${patrol.type}, all clear.\n`;
  return startString + additionalLine + endString;
}

      
}

export default Shift;