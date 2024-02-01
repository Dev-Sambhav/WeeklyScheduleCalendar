import express from "express";
import fs from "fs";
import cors from "cors";
import moment from "moment";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Define the path to the data.json file
const __dirname = path.resolve();
const dataFilePath = path.join(__dirname, "data.json");

// Helper function to read data from JSON file
const readDataFromFile = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading file:", error);
    return { data: [] };
  }
};

// Helper function to write data to JSON file
const writeDataToFile = (jsonData) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));
};

app.post("/api/save-events", (req, res) => {
  const newEvents = req.body.data;
  // Read existing data from file
  const existingData = readDataFromFile();

  // Filter out duplicates by comparing IDs
  const uniqueNewEvents = newEvents.filter((newEvent) => {
    return !existingData.data.some(
      (existingEvent) => existingEvent.id === newEvent.id
    );
  });

  // Append only unique new events to existing data
  existingData.data.push(...uniqueNewEvents);

  // Write updated data to file
  writeDataToFile(existingData);

  console.log("Events saved successfully");
  res.status(201).json({ message: "Events saved successfully" });
});

// API endpoint to fetch events for the week containing the selected date
app.get("/api/calendar-events", (req, res) => {
  const { year, month, day } = req.query;
  console.log(year, month, day);
  // Calculate the start and end dates of the week containing the selected date
  const selectedDate = moment(`${year}-${month}-${day}`);
  const startOfWeek = selectedDate.clone().startOf("week");
  const endOfWeek = selectedDate.clone().endOf("week");

  // Read data from file
  const jsonData = readDataFromFile();
  const events = jsonData.data;

  // Filter events for the week containing the selected date
  const weekEvents = events.filter((event) => {
    const eventDate = moment(event.date);
    return eventDate.isBetween(startOfWeek, endOfWeek, null, "[]");
  });

  res.json(weekEvents);
});

// --------Deployment Start---------

if (process.env.NODE_ENV === "production") {
  // Serve static files from the frontend/dist directory
  app.use(express.static(path.join(__dirname, "frontend", "dist")));

  // Catch-all route for serving the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// --------Deployment End---------

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
