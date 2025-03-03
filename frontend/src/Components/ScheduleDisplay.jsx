import React from "react";

const ScheduleDisplay = ({ schedule, attempts, questionStatus, skips, isSavingPerformance, handleSaveProgress, handleAttemptChange, handleStatusChange, handleSkipQuestion, handleSaveSchedule }) => {
  if (!schedule || Object.keys(schedule).length === 0) {
    return <div className="text-center p-4">No schedule available.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Generated Schedule</h2>
      <button
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        onClick={handleSaveSchedule}
      >
        Save Schedule
      </button>
      {Object.entries(schedule).map(([date, questions]) => (
        <div key={date} className="mb-8">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{date}</h3>
            <button
              className={`px-4 bg-blue-500 text-white rounded hover:bg-blue-600 ml-4 ${
                isSavingPerformance[date] ? "opacity-75 cursor-not-allowed" : ""
              }`}
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
                      <a href={q.link} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
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
  );
};

export default ScheduleDisplay;