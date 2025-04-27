import React, { useState } from "react";
import { format, addDays, startOfWeek, subWeeks, addWeeks } from "date-fns";

const machines = ["VP1000", "Gearg", "TRIMANS", "Huron"];

// Sample scheduling data
const schedule = {
  Gearg: {
    "2025-04-17": "Beta1",
    "2025-04-18": "Beta1",
  },
  TRIMANS: {
    "2025-04-19": "Beta2",
    "2025-04-21": "Beta2",
    "2025-04-22": "Beta2",
  },
  Huron: {
    "2025-04-22": "Beta3",
    "2025-04-23": "Beta3",
  },
};

// Work task → background color mapping
const workColors = {
  Beta1: "red",
  Beta2: "green",
  Beta3: "blue",
};

const WeeklyMachineSchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const start = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday
  const dates = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className='p-4 flex justify-center'>
      <div className='w-[90%]'>
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded'
          >
            ← Previous
          </button>
          <h2 className='text-xl font-bold text-center'>
            Week of {format(start, "dd-MMM-yyyy")}
          </h2>
          <button
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded'
          >
            Next →
          </button>
        </div>

        <table className='w-full text-sm border-collapse shadow-lg'>
          <thead>
            <tr className='bg-gray-800 text-white'>
              <th className='p-2 border border-gray-700 text-left'>Machine</th>
              {dates.map((date) => (
                <th
                  key={date}
                  className={`p-2 border border-gray-700 text-center ${
                    date.getDay() === 0 ? "bg-red-500 text-white" : ""
                  }`}
                  style={{
                    backgroundColor: date.getDay() === 6 ? "red" : "black",
                  }}
                >
                  {format(date, "dd-MMM")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {machines.map((machine) => (
              <tr key={machine} className='bg-gray-900 text-white'>
                <td className='p-2 border border-gray-700 font-semibold'>
                  {machine}
                </td>
                {dates.map((date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const task = schedule[machine]?.[dateKey];
                  const taskColor = workColors[task] || "";
                  return (
                    <td
                      key={dateKey}
                      className={`p-2 border border-gray-700 text-center rounded ${taskColor}`}
                      style={{ backgroundColor: taskColor }}
                    >
                      {task || ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyMachineSchedule;
