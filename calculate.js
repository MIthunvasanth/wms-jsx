function simulateAndValidateSchedule(data) {
  const quantity = parseInt(data.quantity);
  const startDate = new Date(data.startDateTime);
  const endDate = new Date(data.endDateTime);
  const machines = data.machines;
  const dailyHours = parseFloat(data.dailyHours);
  const dailyMinutes = dailyHours * 60;

  // Utility to get next valid working time
  function getNextAvailableTime(currentTime, durationMinutes) {
    const startOfDay = new Date(currentTime);
    startOfDay.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);

    const minutesSinceDayStart = (currentTime - startOfDay) / (1000 * 60);

    if (minutesSinceDayStart + durationMinutes <= dailyMinutes) {
      return currentTime;
    }

    // Move to next day's start
    const nextDay = new Date(startOfDay);
    nextDay.setDate(startOfDay.getDate() + 1);
    return nextDay;
  }

  // Each machine logs processing units
  const machineLogs = machines.map((machine, mIndex) => ({
    name: machine.name,
    units: [],
    totalTimeMinutes: 0,
  }));

  for (let unit = 0; unit < quantity; unit++) {
    for (let m = 0; m < machines.length; m++) {
      const machine = machines[m];
      const timePerUnit = machine.timePerUnit;

      let availableTime;
      if (unit === 0 && m === 0) {
        availableTime = new Date(startDate);
      } else if (m === 0) {
        availableTime = new Date(machineLogs[m].units[unit - 1].end);
      } else if (unit === 0) {
        availableTime = new Date(machineLogs[m - 1].units[unit].end);
      } else {
        const prevUnitThisMachineEnd = new Date(
          machineLogs[m].units[unit - 1].end
        );
        const thisUnitPrevMachineEnd = new Date(
          machineLogs[m - 1].units[unit].end
        );
        availableTime = new Date(
          Math.max(prevUnitThisMachineEnd, thisUnitPrevMachineEnd)
        );
      }

      // Ensure work starts in working hours
      availableTime = getNextAvailableTime(availableTime, timePerUnit);
      const endTime = new Date(availableTime);
      endTime.setMinutes(endTime.getMinutes() + timePerUnit);

      machineLogs[m].units.push({
        unit: unit + 1,
        start: new Date(availableTime),
        end: new Date(endTime),
      });

      machineLogs[m].totalTimeMinutes += timePerUnit;
    }
  }

  // Calculate the actual project end time (last machine, last unit)
  const actualEndTime =
    machineLogs[machineLogs.length - 1].units.slice(-1)[0].end;

  const totalDaysAvailable =
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const totalAvailableMinutes = totalDaysAvailable * dailyMinutes;

  // Calculate actual total time needed (using machine logs)
  const totalProcessingMinutes =
    Math.max(...machineLogs.map((m) => m.units.slice(-1)[0].end - startDate)) /
    (1000 * 60);

  const success = actualEndTime <= endDate;

  const requiredDailyHours = (
    totalProcessingMinutes /
    totalDaysAvailable /
    60
  ).toFixed(2);
  const additionalHours = Math.max(0, requiredDailyHours - dailyHours).toFixed(
    2
  );

  return {
    success,
    requiredDailyHours: parseFloat(requiredDailyHours),
    additionalHoursNeeded: success ? 0 : parseFloat(additionalHours),
    actualEndTime: actualEndTime.toISOString(),
    machineLogs: machineLogs.map((m) => ({
      name: m.name,
      totalHours: (m.totalTimeMinutes / 60).toFixed(2),
      units: m.units.map((u) => ({
        unit: u.unit,
        start: u.start.toISOString(),
        end: u.end.toISOString(),
      })),
    })),
  };
}

const data = {
  id: "L6Cz7jwtgz",
  name: "test",
  address: "6setes",
  gst: "2345432",
  quantity: "11",
  startDateTime: "2025-05-02T22:11",
  endDateTime: "2025-05-05T22:11",
  dailyHours: "11",
  machines: [
    {
      name: "t1",
      timePerUnit: 120,
    },
    {
      name: "t2",
      timePerUnit: 120,
    },
    {
      name: "t3",
      timePerUnit: 130,
    },
    {
      name: "t4",
      timePerUnit: 110,
    },
    {
      name: "t5",
      timePerUnit: 100,
    },
  ],
};
console.log(simulateAndValidateSchedule(data));
