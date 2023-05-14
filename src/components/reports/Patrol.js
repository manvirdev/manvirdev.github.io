// Patrol.js

import Person from './Person';

class Patrol {
  constructor(type, officer, startTime, endTime) {
    this.type = type;
    this.officer = officer;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

export default Patrol;
