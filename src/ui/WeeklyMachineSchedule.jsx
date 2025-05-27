import React, { useEffect, useState, useMemo } from "react";
import {
  format,
  addDays,
  parseISO,
  addMinutes,
  isSunday,
  isBefore,
  startOfDay,
} from "date-fns";
import "./style/machines.css";
import { useParams } from "react-router-dom";

// Generate distinct colors for machines
function getColorFromIndex(index) {
  const colors = [
    "#E57373",
    "#64B5F6",
    "#81C784",
    "#FFF176",
    "#BA68C8",
    "#4DD0E1",
    "#FFD54F",
    "#A1887F",
    "#90A4AE",
    "#F06292",
  ];
  return colors[index % colors.length];
}

function getWorkingDates(startDateStr, endDateStr) {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const dates = [];
  let current = start;

  while (current <= end) {
    // Include all days, including Sundays
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

function isWithinWorkingHours(date, startDateTime, dailyMinutes) {
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    startDateTime.getHours(),
    startDateTime.getMinutes()
  );
  const dayEnd = addMinutes(dayStart, dailyMinutes);
  return isBefore(date, dayEnd);
}

function assignTrueSequentialSchedule(
  machines,
  quantity,
  startDateTime,
  dailyMinutes
) {
  const schedule = {};
  const machineStates = machines.map(() => ({
    availableTime: parseISO(startDateTime),
  }));

  const dailyStart = parseISO(startDateTime);
  const unitTimestamps = Array(quantity)
    .fill(null)
    .map(() => []);
  machines.forEach((machine) => {
    schedule[machine.name] = [];
  });

  for (let unitIdx = 0; unitIdx < quantity; unitIdx++) {
    let unitStartTime = parseISO(startDateTime);
    for (let m = 0; m < machines.length; m++) {
      const machine = machines[m];
      const prevFinish = unitTimestamps[unitIdx][m - 1] || unitStartTime;
      const machineAvailable = machineStates[m].availableTime;
      let start = prevFinish > machineAvailable ? prevFinish : machineAvailable;

      while (
        isSunday(start) ||
        !isWithinWorkingHours(start, dailyStart, dailyMinutes)
      ) {
        const nextDay = addDays(startOfDay(start), 1);
        start = new Date(
          nextDay.getFullYear(),
          nextDay.getMonth(),
          nextDay.getDate(),
          dailyStart.getHours(),
          dailyStart.getMinutes()
        );
      }

      const end = addMinutes(start, machine.timePerUnit);
      unitTimestamps[unitIdx][m] = end;
      machineStates[m].availableTime = end;

      schedule[machine.name].push({
        unit: unitIdx + 1,
        start,
        end,
        date: format(start, "yyyy-MM-dd"),
      });
    }
  }

  return schedule;
}

const WeeklyMachineSchedule = () => {
  const [data, setData] = useState(null);
  const [dates, setDates] = useState([]);
  const [machines, setMachines] = useState([]);
  const [dailyMinutes, setDailyMinutes] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const { id } = useParams();

  useEffect(() => {
    getCompanyData(id);
  }, []);

  const getCompanyData = (id) => {
    window.machineAPI.getCompanies().then((companies) => {
      const matchedCompany = companies.find((company) => company.id === id);
      if (matchedCompany) {
        setData(matchedCompany);
        if (matchedCompany?.startDateTime && matchedCompany?.endDateTime) {
          const workingDates = getWorkingDates(
            matchedCompany.startDateTime,
            matchedCompany.endDateTime
          );
          setDates(workingDates);
        }
        if (Array.isArray(matchedCompany?.machines)) {
          const machineNames = matchedCompany.machines.map((m) => m.name);
          setMachines(machineNames);
        }
        if (matchedCompany?.dailyHours) {
          setDailyMinutes(parseInt(matchedCompany.dailyHours) * 60);
        }
        if (matchedCompany?.quantity) {
          setQuantity(parseInt(matchedCompany.quantity));
        }
      }
    });
  };

  const schedule = useMemo(() => {
    if (
      data?.machines &&
      data?.startDateTime &&
      dailyMinutes > 0 &&
      quantity > 0
    ) {
      return assignTrueSequentialSchedule(
        data.machines,
        quantity,
        data.startDateTime,
        dailyMinutes
      );
    }
    return {};
  }, [data?.machines, data?.startDateTime, dailyMinutes, quantity]);

  return (
    <div className='schedule-container'>
      <div className='schedule-wrapper'>
        <h2 className='schedule-title'>
          Machine Schedule{" "}
          {dates.length > 0
            ? `(${format(dates[0], "dd-MMM")} - ${format(
                dates[dates.length - 1],
                "dd-MMM"
              )})`
            : "(No working days)"}
        </h2>

        <table className='schedule-table'>
          <thead>
            <tr className='schedule-thead-tr'>
              <th className='schedule-th schedule-th-left'>Machine</th>
              {dates.map((date) => {
                const isSun = isSunday(date);
                return (
                  <th
                    key={date.toISOString()}
                    className={`schedule-th text-center ${
                      isSun ? "sunday-header" : ""
                    }`}
                    style={
                      isSun
                        ? { backgroundColor: "#ffcccc", color: "#b00000" }
                        : {}
                    }
                  >
                    {format(date, "dd-MMM")}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {machines.map((machine, machineIdx) => {
              const color = getColorFromIndex(machineIdx);
              return (
                <tr key={machine} className='schedule-tr'>
                  <td className='schedule-machine-name'>{machine}</td>
                  {dates.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isSun = isSunday(date);
                    const unitsOnDate =
                      schedule?.[machine]?.filter(
                        (entry) => entry.date === dateStr
                      ) || [];
                    return (
                      <td
                        key={dateStr}
                        className={`schedule-td ${isSun ? "sunday-cell" : ""}`}
                        style={isSun ? { backgroundColor: "#ffe5e5" } : {}}
                      >
                        {unitsOnDate.length > 0 && (
                          <div
                            className='unit-count'
                            style={{
                              backgroundColor: color,
                              color: "#fff",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              display: "inline-block",
                            }}
                          >
                            {unitsOnDate.length} unit(s)
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyMachineSchedule;
