// Shift.js
import moment from "moment";
import axios from "axios";

class Shift {
    constructor(briefingOfficer, startTime, endTime, officers, patrols) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.briefingOfficer = briefingOfficer;
        this.officers = officers;
        this.patrols = patrols;
    }

    async getWeatherData(city) {
        const apiKey = "0b5dec097d48d73f2e8e06cde9bab8fd";
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=49.25&longitude=-123.12&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours&forecast_days=1&timezone=auto`;
      
        try {
          const response = await axios.get(apiUrl);
          const forecastData = response.data;
          const { maxTemperature, minTemperature, precipitation } = this.extractWeatherDataForStartTime(forecastData);
      
          return { maxTemperature, minTemperature, precipitation };
        } catch (error) {
          console.error("Error fetching weather data:", error);
          return null;
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
        const weatherData = await this.getWeatherData("New York");

        // Add weather data to the report
        if (weatherData) {
          const { maxTemperature, minTemperature, precipitation } = weatherData;
          report.push(`Weather data for the day: Max Temperature: ${maxTemperature}°C, `);
          report.push(`Min Temperature: ${minTemperature}°C, `);
          report.push(`Precipitation: ${precipitation} mm\n`);
        }
        report.push(...this.getStartingNotes())
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

    getStartingNotes() {
        const startingNotes = [];
        const briefingTime = this.startTime.format("HH:mm");

        // Start time: S/O briefing officer briefed all the officers' names
        const briefingNote = `${briefingTime}: S/O ${this.briefingOfficer.firstName} ${this.briefingOfficer.lastName.toUpperCase()} briefed ${this.getOfficersList()} and handed over the keys.\n`;

        startingNotes.push(briefingNote);

        // Start time + 10 mins: All the officers read the passon
        const readPassonTime = this.startTime.clone().add(10, "minutes").format("HH:mm");
        const officersList = this.getOfficersList();
        const readPassonNote = `${readPassonTime}: ${officersList} read the pass-on and emails.\n`;

        startingNotes.push(readPassonNote);

        return startingNotes;
    }

    getOfficersList() {
        return this.officers.map((officer) => `S/O ${officer.firstName} ${officer.lastName.toUpperCase()}`).join(", ");
    }


}

export default Shift;