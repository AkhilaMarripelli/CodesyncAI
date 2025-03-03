import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


const DSAProficiency = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [proficiency, setProficiency] = useState({});
  const [schedule, setSchedule] = useState(null);
  const [dsaTopics, setDsaTopics] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [skips, setSkips] = useState({});
  const [showProficiency, setShowProficiency] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isSavingPerformance, setIsSavingPerformance] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(true);
  const [proficiencyVisible, setProficiencyVisible] = useState(true);

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
    setCalendarVisible(false);
    setTimeout(() => {
      setSelectedDate(date);
      setShowProficiency(true);
    }, 300);
  };


  const handleProficiencyClick = (topic, level) => {
    setProficiency((prev) => ({ ...prev, [topic]: level }));
  };
  const handleGenerateSchedule = async () => {
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
      setShowSchedule(true);
    } catch (error) {
      console.error("Error generating schedule:", error);
    }
    setShowSchedule(true);
    setProficiencyVisible(false); // Hide proficiency levels
    setTimeout(() => {
        setShowSchedule(true); // Show schedule after transition
    }, 300);
  };

  
  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
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
    const userId = await fetchUserId();
    if (!userId) {
      alert("User not found. Please log in again.");
      return;
    }
    const formattedSchedule = {
      userId,
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
  const handleAttemptChange = (e, questionId, date) => {
    const value = parseInt(e.target.value, 10) || 0;
    setAttempts((prev) => ({ ...prev, [questionId]: value }));
  };
  const handleSkipQuestion = (questionId, date) => {
    setSkips((prev) => ({ ...prev, [questionId]: (prev[questionId] || 0) + 1 }));
  };
  const handleStatusChange = (questionId, date) => {
    setQuestionStatus((prev) => {
      const newStatus = prev[questionId] === "completed" ? "pending" : "completed";
      return { ...prev, [questionId]: newStatus };
    });
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
    if (isSaving) return;
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

  const handleSkipProficiency = () => {
     setProficiencyVisible(false); // Hide proficiency levels
    handleGenerateSchedule();
  };
  const quotes = [
    "Pick a date, or the algorithms will pick you... for extra homework.",
    "Your coding adventure awaits! (But first, you gotta pick a date. No time travel allowed.)",
    "Don't let your DSA skills gather dust. Select a date and let's get this show on the road!",
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setQuoteVisible(true);
      }, 500); // Wait for fade out, then change quote and fade in
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(quoteInterval); // Cleanup on unmount
  }, [quotes.length]);
  return (
    // <div className="min-h-screen bg-gradient-to-r from-purple-400 to-blue-500 p-6 flex flex-col items-center">
    <div className="min-h-screen bg-gradient-to-r from-teal-600 to-blue-500 p-6 flex flex-col items-center">  
 {calendarVisible && (
  <div className="relative transition-opacity duration-300 ease-in-out opacity-100 min-h-screen">
    <div className="text-center flex flex-col justify-center min-h-[calc(100vh-100px)]">
      <h1 className="text-3xl font-bold text-white mb-6 animate-pulse">
        Select a Date to Start
      </h1>
      <div className="animate-slide-up">
      <Calendar
  onChange={handleDateChange}
  value={selectedDate}
  className="rounded-2xl shadow-md border-2 border-gray-100 p-4 w-full max-w-md mx-auto bg-white bg-opacity-30 backdrop-blur-md"
  tileClassName={({ date, view }) =>
    view === 'month' && date.getDate() === new Date().getDate()
      ? 'rounded-lg p-2 bg-blue-100 bg-opacity-50 transition duration-300 ease-in-out'
      : 'rounded-lg p-2 transition duration-300 ease-in-out'
  }
  activeStartDate={selectedDate}
  nextLabel={<span className="text-gray-600">&#8250;</span>}
  prevLabel={<span className="text-gray-600">&#8249;</span>}
  next2Label={null}
  prev2Label={null}
  formatMonthYear={(locale, date) => date.toLocaleString(locale, { month: 'short', year: 'numeric' })}
  formatShortWeekday={(locale, date) => date.toLocaleString(locale, { weekday: 'short' })}
  formatDay={(locale, date) => date.toLocaleString(locale, { day: 'numeric' })}
/>  

      </div>
    </div>

    {/* Quote Container at the Bottom */}
    <div className="fixed bottom-0 left-0 w-full text-center p-4">
      {quoteVisible && (
        <p
        className="text-4xl text-white animate-fade-in-scale transition-opacity duration-500 font-semibold font-serif"
        key={currentQuoteIndex}
        >
          {quotes[currentQuoteIndex]}
        </p>
      )}
    </div>
  </div>
)}
      {showProficiency && (
  <div className="w-full max-w-lg space-y-4 transition-opacity duration-300 ease-in-out opacity-100">
    <h2 className="text-2xl font-bold text-white mb-4">Set Proficiency Levels</h2>
    {dsaTopics.map((topic, index) => (
      <div
        key={index}
        className={`flex justify-between items-center p-4 bg-white rounded-lg shadow-md animate-proficiency-bar`}
        style={{ animationDelay: `${index * 100}ms` }}
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
    <div className="flex justify-end mt-4">
            <button
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
              onClick={handleSkipProficiency}
            >
              Skip
            </button>
            <button
              className="ml-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              onClick={handleGenerateSchedule}
            >
              Generate Schedule
            </button>
          </div>
        </div>
      )}
      {showSchedule && schedule && Object.keys(schedule).length > 0 && (
        // <div className="p-6 bg-gradient-to-r from-blue-100 to-indigo-100 min-h-screen flex flex-col items-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl mt-5 ">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Generated Schedule</h2>
            <div className="flex justify-end mb-8">
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:from-purple-600 hover:to-blue-500 transition duration-300"
                onClick={handleSaveSchedule}
              >
                Save Schedule
              </button>
            </div>
            {Object.entries(schedule).map(([date, questions]) => (
              <div key={date} className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-700">{date}</h3>
                  <button
                    className={`px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 ${
                      isSavingPerformance[date] ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleSaveProgress(date)}
                    disabled={isSavingPerformance[date]}
                  >
                    {isSavingPerformance[date] ? "Saving..." : "Save Progress"}
                  </button>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full bg-white border border-gray-200 rounded-2xl shadow-md">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skips</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {questions.map((q) => {
                        const isSkipped = skips[q._id] > 0;
                        const isCompleted = questionStatus[q._id] === "completed";
                        return (
                          <tr key={q._id} className={isSkipped ? "opacity-60" : ""}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{q.topic}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{q.question}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                              <a href={q.link} target="_blank" rel="noopener noreferrer">
                                Link
                              </a>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <input
                                type="number"
                                className="w-16 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-300"
                                min="0"
                                value={attempts[q._id] || 0}
                                onChange={(e) => handleAttemptChange(e, q._id, date)}
                                disabled={!isCompleted || isSkipped}
                              />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleStatusChange(q._id, date)}
                                className={`px-4 py-2 rounded-full transition duration-300 ${
                                  isCompleted ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                }`}
                                disabled={isSkipped}
                              >
                                {isCompleted ? "Completed" : "Pending"}
                              </button>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleSkipQuestion(q._id, date)}
                                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
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
              </div>
            ))}
          </div>
        // </div>
      )}
    </div>
  );
};

export default DSAProficiency;