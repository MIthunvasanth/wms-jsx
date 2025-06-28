import React, { useEffect, useState, useMemo } from "react";
import {
  format,
  addDays,
  parseISO,
  addMinutes,
  isSunday,
  isBefore,
  startOfDay,
  differenceInDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import "./style/machines.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Package,
  Settings,
  TrendingUp,
  Info,
  AlertCircle,
} from "lucide-react";

// Generate distinct colors for machines
function getColorFromIndex(index) {
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#EC4899", // Pink
    "#84CC16", // Lime
    "#6366F1", // Indigo
  ];
  return colors[index % colors.length];
}

function getWorkingDates(startDateStr, endDateStr) {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const dates = [];
  let current = start;

  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

function isWithinWorkingHours(date, startDateTime, dailyMinutes, holidays) {
  const dateString = format(date, "yyyy-MM-dd");
  if (holidays.some((h) => h.date === dateString)) {
    return false;
  }
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

function generateSchedule(order, company, holidays) {
  if (!order || !company) return {};

  const schedule = {};
  const startDate = parseISO(order.startDate);
  const endDate = parseISO(order.endDate);
  const dailyHours = company.dailyHours || 8;
  const dailyMinutes = dailyHours * 60;
  const units = order.units || 1;

  // Get working dates
  const workingDates = getWorkingDates(order.startDate, order.endDate);

  // Calculate total working days
  const totalWorkingDays = workingDates.filter((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return !isSunday(date) && !holidays.some((h) => h.date === dateStr);
  }).length;

  // Calculate units per day
  const unitsPerDay = Math.ceil(units / totalWorkingDays);

  // Generate schedule for the specific machine
  const machineSchedule = [];
  let currentUnit = 1;

  workingDates.forEach((date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const isSun = isSunday(date);
    const isHoliday = holidays.some((h) => h.date === dateStr);

    if (!isSun && !isHoliday && currentUnit <= units) {
      const unitsForDay = Math.min(unitsPerDay, units - currentUnit + 1);
      machineSchedule.push({
        date: dateStr,
        units: unitsForDay,
        startUnit: currentUnit,
        endUnit: currentUnit + unitsForDay - 1,
      });
      currentUnit += unitsForDay;
    }
  });

  schedule[order.machineName] = machineSchedule;
  return schedule;
}

const WeeklyMachineSchedule = () => {
  const [order, setOrder] = useState(null);
  const [company, setCompany] = useState(null);
  const [dates, setDates] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load order data
      const orderData = await window.orderAPI.getOrder(id);
      if (!orderData) {
        setError("Order not found");
        return;
      }
      setOrder(orderData);

      // Load company data
      const companies = await window.companyAPI.getCompanies();
      const companyData = companies.find((c) => c.id === orderData.companyId);
      setCompany(companyData);

      // Load holidays
      const holidayData = await window.holidayAPI.getHolidays();
      setHolidays(holidayData);

      // Generate working dates
      if (orderData.startDate && orderData.endDate) {
        const workingDates = getWorkingDates(
          orderData.startDate,
          orderData.endDate
        );
        setDates(workingDates);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load order data");
    } finally {
      setLoading(false);
    }
  };

  const schedule = useMemo(() => {
    if (order && company) {
      return generateSchedule(order, company, holidays);
    }
    return {};
  }, [order, company, holidays]);

  const getTotalUnits = () => {
    if (!schedule[order?.machineName]) return 0;
    return schedule[order.machineName].reduce(
      (total, day) => total + day.units,
      0
    );
  };

  const getProgressPercentage = () => {
    if (!order) return 0;
    const totalDays =
      differenceInDays(parseISO(order.endDate), parseISO(order.startDate)) + 1;
    const completedDays = dates.filter((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return (
        new Date(dateStr) <= new Date() &&
        !isSunday(date) &&
        !holidays.some((h) => h.date === dateStr)
      );
    }).length;
    return Math.min((completedDays / totalDays) * 100, 100);
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="schedule-container">
        <div className="error-state">
          <AlertCircle size={48} className="error-icon" />
          <h2>Error Loading Schedule</h2>
          <p>{error || "Order not found"}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            <ChevronLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      {/* Header Section */}
      <div className="schedule-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} />
            <span>Back to Orders</span>
          </button>
          <div className="header-content">
            <h1 className="schedule-title">
              <Calendar size={28} />
              Production Schedule
            </h1>
            <p className="schedule-subtitle">
              {order.productName} - {order.machineName}
            </p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <Package size={20} />
            <div>
              <span className="stat-value">{getTotalUnits()}</span>
              <span className="stat-label">Total Units</span>
            </div>
          </div>
          <div className="stat-item">
            <TrendingUp size={20} />
            <div>
              <span className="stat-value">
                {getProgressPercentage().toFixed(1)}%
              </span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Card */}
      <div className="order-details-card">
        <div className="details-grid">
          <div className="detail-item">
            <Package size={16} />
            <div>
              <span className="detail-label">Product</span>
              <span className="detail-value">{order.productName}</span>
            </div>
          </div>
          <div className="detail-item">
            <Settings size={16} />
            <div>
              <span className="detail-label">Machine</span>
              <span className="detail-value">{order.machineName}</span>
            </div>
          </div>
          <div className="detail-item">
            <Calendar size={16} />
            <div>
              <span className="detail-label">Start Date</span>
              <span className="detail-value">
                {format(parseISO(order.startDate), "MMM dd, yyyy")}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <Calendar size={16} />
            <div>
              <span className="detail-label">End Date</span>
              <span className="detail-value">
                {format(parseISO(order.endDate), "MMM dd, yyyy")}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <Clock size={16} />
            <div>
              <span className="detail-label">Process</span>
              <span className="detail-value">{order.processName}</span>
            </div>
          </div>
          <div className="detail-item">
            <Info size={16} />
            <div>
              <span className="detail-label">Status</span>
              <span className={`status-badge status-${order.status}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="schedule-wrapper">
        <div className="schedule-table-header">
          <h2>Production Timeline</h2>
          <div className="schedule-info">
            <span className="info-item">
              <div className="color-indicator working"></div>
              Working Days
            </span>
            <span className="info-item">
              <div className="color-indicator holiday"></div>
              Holidays
            </span>
            <span className="info-item">
              <div className="color-indicator sunday"></div>
              Sundays
            </span>
          </div>
        </div>

        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr className="schedule-thead-tr">
                <th className="schedule-th schedule-th-left">Date</th>
                <th className="schedule-th">Day</th>
                <th className="schedule-th">Units</th>
                <th className="schedule-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((date, index) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isSun = isSunday(date);
                const isHoliday = holidays.some((h) => h.date === dateStr);
                const daySchedule = schedule[order.machineName]?.find(
                  (s) => s.date === dateStr
                );

                return (
                  <tr
                    key={dateStr}
                    className={`schedule-tr ${
                      isSun || isHoliday ? "non-working" : "working"
                    }`}
                  >
                    <td className="schedule-date">
                      {format(date, "MMM dd, yyyy")}
                    </td>
                    <td className="schedule-day">
                      {format(date, "EEEE")}
                      {(isSun || isHoliday) && (
                        <span className="day-indicator">
                          {isSun ? "Sunday" : "Holiday"}
                        </span>
                      )}
                    </td>
                    <td className="schedule-units">
                      {daySchedule ? (
                        <div className="units-display">
                          <span className="unit-count">
                            {daySchedule.units}
                          </span>
                          <span className="unit-range">
                            Units {daySchedule.startUnit}-{daySchedule.endUnit}
                          </span>
                        </div>
                      ) : (
                        <span className="no-units">No Production</span>
                      )}
                    </td>
                    <td className="schedule-status">
                      {daySchedule ? (
                        <span className="status-working">Scheduled</span>
                      ) : isSun ? (
                        <span className="status-sunday">Sunday</span>
                      ) : isHoliday ? (
                        <span className="status-holiday">Holiday</span>
                      ) : (
                        <span className="status-idle">Idle</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMachineSchedule;
