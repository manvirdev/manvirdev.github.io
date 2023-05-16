import moment from 'moment';
import Person from './Person';

class Patrol {
  constructor(type, officer, backupOfficer, startTime, endTime) {
    this.type = type;
    this.officer = officer;
    this.startTime = startTime;
    this.endTime = endTime;
    this.backupOfficer = backupOfficer;
  }

  toString() {
  }
}

export default Patrol;
