import React, { useState, useEffect } from "react";
import moment from "moment-timezone"; // Importing Moment.js library for date manipulation
import { toast } from "react-toastify"; // Importing toast notifications
import axios from "axios"; // Importing axios for HTTP requests

const WeeklySchedule = () => {
  // State variables using React hooks
  const [currentDate, setCurrentDate] = useState(moment()); // Current date state
  const [selectedTimeZone, setSelectedTimeZone] = useState("UTC"); // Selected time zone state
  const [selectedEvents, setSelectedEvents] = useState([]); // Selected events state
  const [selectedDate, setSelectedDate] = useState(moment()); // Selected date state
  const [days, setDays] = useState([]); // Days array state

  const actualDate = moment(); // Current date

  // Generating time slots for the day
  const timeSlots = Array.from({ length: 31 }, (_, i) =>
    moment
      .utc()
      .startOf("day")
      .add(8, "hours")
      .add(i * 30, "minutes")
  );

  // Function to handle navigating to the previous week
  const handlePreviousWeek = () => {
    setCurrentDate((prevDate) => prevDate.clone().subtract(1, "week"));
  };

  // Function to handle navigating to the next week
  const handleNextWeek = () => {
    setCurrentDate((prevDate) => prevDate.clone().add(1, "week"));
  };

  // Function to handle changing the selected time zone
  const handleChangeTimeZone = (e) => {
    setSelectedTimeZone(e.target.value);
  };

  // Function to toggle selection of checkbox for an event
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

  // Function to handle saving events to the backend
  const handleSave = async () => {
    try {
      // Send HTTP POST request to save events
      const { data } = await axios.post("/api/save-events", {
        data: selectedEvents,
      });
      // Show success message
      toast(data.message);
      // Clear selected events
      setSelectedEvents([]);
    } catch (error) {
      console.error("Error saving events:", error);
    }
  };

  // Re-render component when new date picked
  useEffect(() => {
    // Calculate start and end of the week
    const startOfWeek = currentDate.clone().startOf("week");
    const endOfWeek = currentDate.clone().endOf("week");

    const days = [];
    let tempDate = startOfWeek.clone();
    // Generate days array for the week
    while (tempDate.isSameOrBefore(endOfWeek, "day")) {
      if (tempDate.day() >= 1 && tempDate.day() <= 5) {
        days.push(tempDate.clone());
      }
      tempDate.add(1, "day");
    }
    setDays(days); // Update days array state
  }, [currentDate]);

  // Fetch events for the selected date
  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `/api/calendar-events?year=${selectedDate.year()}&month=${
          selectedDate.month() + 1
        }&day=${selectedDate.date()}`
      );
      const data = await response.json();
      setSelectedEvents(data); // Update selected events state
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Fetch events when selected date changes
  useEffect(() => {
    fetchEvents();
    setCurrentDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="p-4">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4">
        <div className="left_nav | flex space-x-4 items-center justify-center">
          {/* Button to navigate to previous week */}
          <button
            onClick={handlePreviousWeek}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Previous
          </button>
          <p>{currentDate.format("MMMM DD, YYYY")}</p> {/* Display current date */}
        </div>
        {/* Input to choose date */}
        <div className="flex space-x-2">
          <p>Choose Date:- </p>
          <input
            type="date"
            value={selectedDate.format("YYYY-MM-DD")}
            onChange={(e) => setSelectedDate(moment(e.target.value))}
          />
        </div>
        {/* Button to navigate to next week */}
        <button
          onClick={handleNextWeek}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Next
        </button>
      </div>
      {/* Timezone selection */}
      <div className="mb-4">
        <p className="mb-2">Timezone</p>
        <select
          value={selectedTimeZone}
          onChange={handleChangeTimeZone}
          className="block w-40 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        >
          {/* Options for different timezones */}
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
        </select>
      </div>
      {/* Days and time slots grid */}
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
                // Display "Past" if day is before current date
                <div className="flex items-center mb-2">Past</div>
              ) : (
                // Render time slots for the day
                timeSlots.map((time, timeIndex) => (
                  <div key={timeIndex} className="flex items-center mb-2">
                    {/* Checkbox for each time slot */}
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
                    {/* Label to display time slot */}
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
      {/* Button to save events */}
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
