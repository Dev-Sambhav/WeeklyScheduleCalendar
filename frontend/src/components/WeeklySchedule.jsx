import React, { useState, useEffect } from "react";
import moment from "moment-timezone";
import {toast} from "react-toastify"
import axios from "axios"

const WeeklySchedule = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedTimeZone, setSelectedTimeZone] = useState("UTC");
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [days, setDays] = useState([]);

  const actualDate = moment();

  const timeSlots = Array.from({ length: 31 }, (_, i) =>
    moment
      .utc()
      .startOf("day")
      .add(8, "hours")
      .add(i * 30, "minutes")
  );

  const handlePreviousWeek = () => {
    setCurrentDate((prevDate) => prevDate.clone().subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentDate((prevDate) => prevDate.clone().add(1, "week"));
  };

  const handleChangeTimeZone = (e) => {
    setSelectedTimeZone(e.target.value);
  };

  // Toggle selection of checkbox
  const handleCheckboxChange = (time, day, timeIndex) => {
    setSelectedEvents((prevEvents) => {
      const eventId = `${day.format("YYYY-MM-DD")}-${timeIndex}`;
      const existingIndex = prevEvents.findIndex(
        (event) => event.id === eventId
      );
      if (existingIndex !== -1) {
        // If the event already exists, remove it
        const updatedEvents = [...prevEvents];
        updatedEvents.splice(existingIndex, 1);
        return updatedEvents;
      } else {
        // If the event doesn't exist, add it
        return [
          ...prevEvents,
          {
            id: eventId,
            date: day.format("YYYY-MM-DD"),
            name: "Event",
            time: time.clone().tz(selectedTimeZone).format("HH:mm"),
          },
        ];
      }
    });
  };

  // Save data into file
const handleSave = async () => {
  try {
    const {data} = await axios.post("/api/save-events", {
      data: selectedEvents,
    });
    toast(data.message);
    setSelectedEvents([]);
  } catch (error) {
    console.error("Error saving events:", error);
  }
};


  // Re-render component when new date picked
  useEffect(() => {
    const startOfWeek = currentDate.clone().startOf("week");
    const endOfWeek = currentDate.clone().endOf("week");

    const days = [];
    let tempDate = startOfWeek.clone();
    while (tempDate.isSameOrBefore(endOfWeek, "day")) {
      if (tempDate.day() >= 1 && tempDate.day() <= 5) {
        days.push(tempDate.clone());
      }
      tempDate.add(1, "day");
    }
    setDays(days);
  }, [currentDate]);

  // Fetch events for the selected date
  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `/api/calendar-events?year=${selectedDate.year()}&month=${
          selectedDate.month() + 1
        }&day=${selectedDate.date()}`
      );
      console.log(response)
      const data = await response.json();
      console.log(data);
      setSelectedEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    setCurrentDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="left_nav | flex space-x-4 items-center justify-center">
          <button
            onClick={handlePreviousWeek}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Previous
          </button>
          <p>{currentDate.format("MMMM DD, YYYY")}</p>
        </div>
        <div className="flex space-x-2">
          <p>Choose Date:- </p>
          <input
            type="date"
            value={selectedDate.format("YYYY-MM-DD")}
            onChange={(e) => setSelectedDate(moment(e.target.value))}
          />
        </div>
        <button
          onClick={handleNextWeek}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Next
        </button>
      </div>
      <div className="mb-4">
        <p className="mb-2">Timezone</p>
        <select
          value={selectedTimeZone}
          onChange={handleChangeTimeZone}
          className="block w-40 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {days.map((day, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-md p-2 flex flex-col"
          >
            <h3 className="font-semibold mb-2">
              {day.format("dddd, MMMM DD")}
            </h3>
            <div className="flex flex-wrap">
              {day.isBefore(actualDate, "day") ? (
                <div className="flex items-center mb-2">Past</div>
              ) : (
                timeSlots.map((time, timeIndex) => (
                  <div key={timeIndex} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="mr-2 ml-2"
                      checked={selectedEvents.some(
                        (event) =>
                          event.id ===
                          `${day.format("YYYY-MM-DD")}-${timeIndex}`
                      )}
                      onChange={() =>
                        handleCheckboxChange(time, day, timeIndex)
                      }
                    />
                    <label>
                      {time.clone().tz(selectedTimeZone).format("h:mm A")}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Save
      </button>
    </div>
  );
};

export default WeeklySchedule;
