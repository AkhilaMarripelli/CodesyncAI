import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DSAProficiency = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [proficiency, setProficiency] = useState({});
  const [schedule, setSchedule] = useState({});
  const [dsaTopics, setDsaTopics] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [skips, setSkips] = useState({});
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-topics");
        const data = await response.json();
        setDsaTopics(data.topics);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    handleGenerateSchedule(date);
  };

  const handleProficiencyClick = (topic, level) => {
    setProficiency((prev) => ({
      ...prev,
      [topic]: level,
    }));
  };

  const handleGenerateSchedule = async (selectedDate) => {
    const userInput = {
      proficiency,
      dailyTime: 120,
      startDate: selectedDate,
      enoughTime: true,
    };

    const token = localStorage.getItem("auth-token");

    try {
      const response = await fetch("http://localhost:5000/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(userInput),
      });

      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      console.error("Error generating schedule:", error);
    }
  };
  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1]; // Extract payload
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64)); // Decode payload
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };
  const fetchUserId = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.user?.id || null;
  };
  

  const handleSaveSchedule = async () => {
    const token = localStorage.getItem("auth-token");
    const userId = await fetchUserId(); // Ensure we correctly await the userId
  
    if (!userId) {
      alert("User not found. Please log in again.");
      return;
    }
  
    const formattedSchedule = {
      userId,  // Now correctly resolved
      schedules: [
        {
          dates: Object.entries(schedule).map(([date, questions]) => ({
            date,
            questions: questions.map((q) => ({
              questionId: q._id, 
              status: "pending",
            })),
          })),
        },
      ],
    };
  
    try {
      const res = await fetch("http://localhost:5000/save-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify(formattedSchedule),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Schedule saved successfully!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };
  const [isSavingPerformance, setIsSavingPerformance] = useState({}); // Track saving state per date
  const [isSaving, setIsSaving] = useState(false); // Overall saving state (for individual question saves)
  const handleAttemptChange = (e, questionId, date) => { // Add date parameter
    const value = parseInt(e.target.value, 10) || 0;
    setAttempts((prev) => ({ ...prev, [questionId]: value }));
    // No immediate API call here
  };

  const handleSkipQuestion = (questionId, date) => { // Add date parameter
    setSkips((prev) => ({ ...prev, [questionId]: (prev[questionId] || 0) + 1 }));
    // No immediate API call here
  };

  const handleStatusChange = (questionId, date) => { // Add date parameter
    setQuestionStatus((prev) => {
      const newStatus = prev[questionId] === "completed" ? "pending" : "completed";
      return { ...prev, [questionId]: newStatus };
    });
    // No immediate API call here
  };

  const handleSaveProgress = async (date) => {
    setIsSavingPerformance((prev) => ({ ...prev, [date]: true }));

    try {
      const userId = await fetchUserId();
      const questionsForDate = schedule[date];

      if (questionsForDate) {
        for (const q of questionsForDate) {
          await saveUserPerformance(q._id, questionStatus[q._id] || "pending", attempts[q._id] || 0, skips[q._id] || 0);
        }
      }

      console.log(`Progress for ${date} saved successfully!`);
    } catch (error) {
      console.error(`Error saving progress for ${date}:`, error);
    } finally {
      setIsSavingPerformance((prev) => ({ ...prev, [date]: false }));
    }
  };

  const saveUserPerformance = async (questionId, status, attempts, skips) => {
    if (isSaving) return; // Prevent duplicate calls for individual question saves

    setIsSaving(true);

    try {
      const userId = await fetchUserId();
      const response = await fetch("http://localhost:5000/save-performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, questionId, status, attempts, skips }),
      });

      const data = await response.json();
      console.log(response.ok ? "Performance saved successfully:" : "Failed to save performance:", data);
    } catch (error) {
      console.error("Error saving performance:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  
  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Select Date and Set Proficiency
      </h1>

      <div className="mb-8">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="rounded-lg shadow-lg border-gray-300"
        />
        <p className="mt-4 text-lg text-gray-700 text-center">
          Selected Date:{" "}
          <span className="font-semibold">{selectedDate.toDateString()}</span>
        </p>
      </div>

      {/* Proficiency Selection */}
      <div className="w-full max-w-lg space-y-4">
        {dsaTopics.map((topic, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md"
          >
            <span className="font-medium text-lg text-gray-800">{topic}</span>
            <div className="flex space-x-2">
              {["Beginner", "Intermediate", "Expert"].map((level) => (
                <button
                  key={level}
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-lg focus:outline-none ${
                    proficiency[topic] === level
                      ? "bg-blue-700"
                      : level === "Beginner"
                      ? "bg-green-500 hover:bg-green-600"
                      : level === "Intermediate"
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  onClick={() => handleProficiencyClick(topic, level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Generated Schedule */}
      {schedule && Object.keys(schedule).length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Generated Schedule
          </h2>
          {/* Save Schedule Button */}
{/* <div className="flex justify-end mt-4"> */}
  <button
    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
    onClick={handleSaveSchedule}
  >
    Save Schedule
  </button>
{/* </div> */}
          {Object.entries(schedule).map(([date, questions]) => (
  <div key={date} className="mb-8">
   <div className="flex items-center"> {/* Align items vertically */}
  <h3 className="text-lg font-semibold text-gray-700 mb-2">{date}</h3>
  <button
    className={`px-4  bg-blue-500 text-white rounded hover:bg-blue-600 ml-4 ${isSavingPerformance[date] ? 'opacity-75 cursor-not-allowed' : ''}`} // Add ml-4
    onClick={() => handleSaveProgress(date)}
    disabled={isSavingPerformance[date]}
  >
    {isSavingPerformance[date] ? "Saving..." : "Save Progress"}
  </button>
</div>
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 px-4 py-2">Topic</th>
          <th className="border border-gray-300 px-4 py-2">Question</th>
          <th className="border border-gray-300 px-4 py-2">Link</th>
          <th className="border border-gray-300 px-4 py-2">Attempts</th>
          <th className="border border-gray-300 px-4 py-2">Status</th>
          <th className="border border-gray-300 px-4 py-2">Skips</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q) => {
          const isSkipped = skips[q._id] > 0;
          const isCompleted = questionStatus[q._id] === "completed";

          return (
            <tr key={q._id} className={isSkipped ? "bg-gray-300 opacity-50" : ""}>
              <td className="border border-gray-300 px-4 py-2">{q.topic}</td>
              <td className="border border-gray-300 px-4 py-2">{q.question}</td>
              <td className="border border-gray-300 px-4 py-2">
                <a
                  href={q.link}
                  className="text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Link
                </a>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <input
                  type="number"
                  className="w-16 p-1 border border-gray-400 rounded"
                  min="0"
                  value={attempts[q._id] || 0}
                  onChange={(e) => handleAttemptChange(e, q._id, date)}
                  disabled={!isCompleted || isSkipped}
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleStatusChange(q._id, date)}
                  className={`px-4 py-2 rounded ${
                    isCompleted ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                  }`}
                  disabled={isSkipped}
                >
                  {isCompleted ? "Completed" : "Pending"}
                </button>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleSkipQuestion(q._id, date)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  disabled={isSkipped}
                >
                  {isSkipped ? "Skipped" : "Skip"}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
))}



        </div>
      )}
    </div>
  );
};

export default DSAProficiency;  
