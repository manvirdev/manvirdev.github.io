// Shift.js
import moment from "moment";
import axios from "axios";
import Patrol from "./Patrol";
import Break from "./Break";

class Shift {
  constructor(briefingOfficer, startTime, endTime, officers, patrols, type, breaks) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.briefingOfficer = briefingOfficer;
    this.officers = officers;
    this.patrols = patrols;
    this.type = type;
    this.breaks = breaks;
  }

  findAvailableTimeSlots() {
    const availableSlots = [];

    //Print all the available data
    console.log('Briefing Officer: ', this.briefingOfficer);
    console.log('Start Time: ', this.startTime);
    console.log('End Time: ', this.endTime);


    // Get the start and end times of the shift
    const shiftStartTime = this.startTime;
    const shiftEndTime = this.endTime;

    // Sort the patrols by their start time
    const sortedPatrols = this.patrols.slice().sort((a, b) => a.startTime - b.startTime);

    // Find the available time slots
    let currentTime = shiftStartTime.clone();
    let nextPatrolIndex = 0;

    while (currentTime.isBefore(shiftEndTime) && nextPatrolIndex < sortedPatrols.length) {
      const nextPatrol = sortedPatrols[nextPatrolIndex];

      if (currentTime.isBefore(nextPatrol.startTime)) {
        // If the current time is before the next patrol, it's an available time slot
        availableSlots.push({
          startTime: currentTime.clone(),
          endTime: nextPatrol.startTime.clone(),
        });
      }

      currentTime = nextPatrol.endTime.clone();
      nextPatrolIndex++;
    }

    if (currentTime.isBefore(shiftEndTime)) {
      // If there are no more patrols but there is still time left in the shift, add the remaining time as an available slot
      availableSlots.push({
        startTime: currentTime.clone(),
        endTime: shiftEndTime.clone(),
      });
    }

    return availableSlots;
  }

  splitTimeSlots(timeSlots) {
    const MINIMUM_SLOT_LENGTH = 35;
    const splitSlots = [];

    timeSlots.forEach((timeSlot) => {
      const { startTime, endTime } = timeSlot;
      const duration = endTime.diff(startTime, 'minutes');

      if (duration >= MINIMUM_SLOT_LENGTH) {
        const numSplits = Math.floor(duration / MINIMUM_SLOT_LENGTH);

        for (let i = 0; i < numSplits; i++) {
          const splitStartTime = startTime.clone().add(i * MINIMUM_SLOT_LENGTH, 'minutes');
          const splitEndTime = splitStartTime.clone().add(MINIMUM_SLOT_LENGTH, 'minutes');
          splitSlots.push({ 'startTime': splitStartTime, 'endTime': splitEndTime });
        }
      }
    });

    return splitSlots;
  }

  addBreak(breakTime) {
    const breakObj = new Break(breakTime.officer,
      breakTime.startTime,
      breakTime.endTime
    )
    this.breaks.push(breakObj);
    console.log('Breaks ', this.breaks);
  }

  async getWeatherData() {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=49.25&longitude=-123.12&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours&forecast_days=1&timezone=auto`;

    try {
      const response = await axios.get(apiUrl);
      const forecastData = response.data;
      const { maxTemperature, minTemperature, precipitation } = this.extractWeatherDataForStartTime(forecastData);

      return { maxTemperature, minTemperature, precipitation };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw new Error("Failed to fetch weather data.");
    }
  }

  extractWeatherDataForStartTime(forecastData) {
    const startDateTime = this.startTime.format("YYYY-MM-DD");
    const currentIndex = forecastData.daily.time.indexOf(startDateTime);

    if (currentIndex !== -1) {
      const maxTemperature = forecastData.daily.temperature_2m_max[currentIndex];
      const minTemperature = forecastData.daily.temperature_2m_min[currentIndex];
      const precipitation = forecastData.daily.precipitation_sum[currentIndex];

      return { maxTemperature, minTemperature, precipitation };
    }

    return { maxTemperature: null, minTemperature: null, precipitation: null };
  }

  async generateReport() {
    const report = [];
    const weatherData = await this.getWeatherData();

    // Add weather data to the report
    if (weatherData) {
      const { maxTemperature, minTemperature, precipitation } = weatherData;
      report.push(`Weather data for the day:\nMax Temperature: ${maxTemperature}°C, `);
      report.push(`Min Temperature: ${minTemperature}°C, `);
      report.push(`Precipitation: ${precipitation} mm\n\n`);
    }
    report.push(...this.getStartingNotes());

    // Sort patrols and breaks by their start time
    const events = [...this.patrols, ...this.breaks];
    events.sort((a, b) => a.startTime - b.startTime);

    events.forEach((event) => {

      if (event instanceof Patrol) {
        const patrol = event;
        const timeDiff = this.calculateTimeDifference(patrol);
        const { status, additionalLine } = this.getStatusAndAdditionalLine(patrol, timeDiff);
        const patrolString = this.getPatrolString(patrol, additionalLine);

        report.push(patrolString);
      } else if (event instanceof Break) {
        const breakTime = event;
        console.log('Break Time = ', breakTime);
        const breakString = this.getBreakString(breakTime);

        report.push(breakString);
      }
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

  getPatrolString(patrol, additionalLine) {
    const startString = `${patrol.startTime.format('HH:mm')}: S/O ${patrol.officer.firstName} ${patrol.officer.lastName.toUpperCase()} started the ${patrol.type} patrol.\n`;
    const endString = `${patrol.endTime.format('HH:mm')}: S/O ${patrol.officer.firstName} ${patrol.officer.lastName.toUpperCase()} completed the ${patrol.type} patrol, all clear.\n`;
    return startString + additionalLine + endString;
  }

  getStartingNotes() {
    const startingNotes = [];
    const briefingTime = this.startTime.format('HH:mm');

    // Construct a string with all briefing officers' names
    const briefingOfficerNames = this.briefingOfficer.map(officer => `${officer.firstName} ${officer.lastName.toUpperCase()}`).join(', ');

    // Start time: S/O briefing officers briefed all the other officers' names
    const briefingNote = `${briefingTime}: S/O ${briefingOfficerNames} briefed ${this.getOfficersList()} and handed over the keys.\n`;

    startingNotes.push(briefingNote);

    // Start time + 10 mins: All the officers read the pass-on
    const readPassonTime = moment(briefingTime, "HH:mm").add(10, "minutes").format("HH:mm");
    const officersList = this.getOfficersList();
    const readPassonNote = `${readPassonTime}: ${officersList} read the pass-on and emails.\n`;

    startingNotes.push(readPassonNote);

    return startingNotes;
  }

  getOfficersList() {
    return this.officers.map((officer) => `S/O ${officer.firstName} ${officer.lastName.toUpperCase()}`).join(", ");
  }

  getBreakString(breakTime) {
    const startString = `${breakTime.startTime.format('HH:mm')}: S/O ${breakTime.officer.firstName} ${breakTime.officer.lastName.toUpperCase()} started the break.\n`;
    const endString = `${breakTime.endTime.format('HH:mm')}: S/O ${breakTime.officer.firstName} ${breakTime.officer.lastName.toUpperCase()} completed the break, all clear.\n`;
    return startString + endString;
  }

}

export default Shift;