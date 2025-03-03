import React, { useState, useEffect } from 'react';

const SchedulePage = () => {
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedDateQuestions, setSelectedDateQuestions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attempts, setAttempts] = useState({});
  const [skips, setSkips] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [isSavingPerformance, setIsSavingPerformance] = useState({});
  const [questionDetails, setQuestionDetails] = useState({});
  const [isSaving, setIsSaving] = useState(false); // Add isSaving state

  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  };

  const fetchUserId = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.user?.id || null;
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const userId = await fetchUserId();
        if (!userId) {
          console.error('User ID not found');
          return;
        }

        const response = await fetch(`http://localhost:5000/schedules/${userId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setScheduleData(data.schedule);
        } else {
          console.error('Schedule not found:', data.message);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchSchedule();
  }, []);

  useEffect(() => {
    if (selectedDateQuestions && selectedDateQuestions.length > 0) {
      const initialAttempts = {};
      const initialSkips = {};
      const initialStatus = {};

      selectedDateQuestions.forEach((q) => {
        initialAttempts[q.questionId] = 0;
        initialSkips[q.questionId] = 0;
        initialStatus[q.questionId] = q.status || 'pending';
      });

      setAttempts(initialAttempts);
      setSkips(initialSkips);
      setQuestionStatus(initialStatus);
    }
  }, [selectedDateQuestions]);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (selectedDateQuestions && selectedDateQuestions.length > 0) {
        const details = {};
        for (const question of selectedDateQuestions) {
          try {
            const response = await fetch(`http://localhost:5000/questions/${question.questionId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                details[question.questionId] = data.question;
              } else {
                console.error(`Question ${question.questionId} not found`);
              }
            } else {
              console.error(`Failed to fetch question ${question.questionId}`);
            }
          } catch (error) {
            console.error(`Error fetching question ${question.questionId}:`, error);
          }
        }
        setQuestionDetails(details);
      }
    };
    fetchQuestionDetails();
  }, [selectedDateQuestions]);

  const handleDateClick = (date, questions) => {
    setSelectedDate(date);
    setSelectedDateQuestions(questions);
  };

  const handleAttemptChange = (e, questionId, date) => {
    setAttempts({ ...attempts, [questionId]: parseInt(e.target.value) });
  };

  const handleStatusChange = (questionId, date) => {
    setQuestionStatus({
      ...questionStatus,
      [questionId]: questionStatus[questionId] === 'completed' ? 'pending' : 'completed',
    });
  };

  const handleSkipQuestion = (questionId, date) => {
    setSkips({ ...skips, [questionId]: (skips[questionId] || 0) + 1 });
  };

  const handleSaveProgress = async (date) => {
    setIsSavingPerformance({ ...isSavingPerformance, [date]: true });
    try {
      const questionsForDate = selectedDateQuestions;
      if (questionsForDate) {
        for (const q of questionsForDate) {
          await saveUserPerformance(q.questionId, questionStatus[q.questionId] || 'pending', attempts[q.questionId] || 0, skips[q.questionId] || 0);
        }
      }
      console.log(`Progress for ${date} saved successfully!`);
    } catch (error) {
      console.error(`Error saving progress for ${date}:`, error);
    } finally {
      setIsSavingPerformance({ ...isSavingPerformance, [date]: false });
    }
  };

  const saveUserPerformance = async (questionId, status, attempts, skips) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const userId = await fetchUserId();
      const response = await fetch('http://localhost:5000/save-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionId, status, attempts, skips }),
      });
      const data = await response.json();
      console.log(response.ok ? 'Performance saved successfully:' : 'Failed to save performance:', data);
    } catch (error) {
      console.error('Error saving performance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!scheduleData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const dates = scheduleData.schedules[0]?.dates || [];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-1/5 bg-white p-4 border-r overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Dates</h2>
        <ul className="space-y-2">
          {dates.map((dateObj) => (
            <li
              key={dateObj.date}
              className={`cursor-pointer p-2 rounded hover:bg-gray-200 ${
                selectedDate === dateObj.date ? 'bg-gray-300' : ''
              }`}
              onClick={() => handleDateClick(dateObj.date, dateObj.questions)}
            >
              {dateObj.date}
            </li>
          ))}
        </ul>
      </aside>

      <main className="w-4/5 p-8">
        {selectedDate ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions for {selectedDate}</h2>
              <button
                className={`px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 ${
                  isSavingPerformance[selectedDate] ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={() => handleSaveProgress(selectedDate)}
                disabled={isSavingPerformance[selectedDate]}
              >
                {isSavingPerformance[selectedDate] ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white border border-gray-200 rounded-2xl shadow-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">Topic</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skips</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedDateQuestions.map((q) => {
                    const isSkipped = skips[q.questionId] > 0;
                    const isCompleted = questionStatus[q.questionId] === 'completed';
                    const details = questionDetails[q.questionId];
                    return (
                      <tr key={q.questionId} className={isSkipped ? 'opacity-60' : ''}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {details ? details.topic : 'Topic not found'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {details ? details.question : 'Question not found'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                          {details && (
                            <a href={details.link} target="_blank" rel="noopener noreferrer">
                              Link
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {details ? details.difficultylevel : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {details ? details.priority : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <input
                            type="number"
                            className="w-16 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-300"
                            min="0"
                            value={attempts[q.questionId] || 0}
                            onChange={(e) => handleAttemptChange(e, q.questionId, selectedDate)}
                            disabled={!isCompleted || isSkipped}
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleStatusChange(q.questionId, selectedDate)}
                            className={`px-4 py-2 rounded-full transition duration-300 ${
                              isCompleted ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                            disabled={isSkipped}
                          >
                            {isCompleted ? 'Completed' : 'Pending'}
                          </button>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleSkipQuestion(q.questionId, selectedDate)}
                            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                            disabled={isSkipped}
                          >
                            {isSkipped ? 'Skipped' : 'Skip'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center mt-8">
            <p className="text-gray-600">Select a date to view questions.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SchedulePage;