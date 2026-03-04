import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.scss';

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.isAdmin ? 'users' : 'quizzes'); // 'users', 'quizzes', 'rewards'
  const [quizzes, setQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [rewardRequests, setRewardRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Quiz Form State
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    name: '',
    totalScore: 100,
    level: 'Easy',
    questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
  });

  const fetchAdminData = async () => {
    try {
      const [usersRes, rewardsRes, quizzesRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/reward/pending'),
        api.get('/quiz')
      ]);
      setUsers(usersRes.data.data || []);
      setRewardRequests(rewardsRes.data.data || []);
      setQuizzes(quizzesRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.isAdmin) {
          await fetchAdminData();
        } else {
          // Fetch user data: Available Quizzes, My Attempts, and My Reward Requests
          const [quizzesRes, attemptsRes, myRewardsRes] = await Promise.all([
            api.get('/quiz'),
            api.get('/user-quiz/my-attempts'),
            api.get('/reward/my-requests')
          ]);
          setQuizzes(quizzesRes.data.data || []);
          setMyAttempts(attemptsRes.data.data || []);
          setMyRequests(myRewardsRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/quiz', newQuiz);
      if (response.data.success) {
        alert('Quiz created successfully!');
        setShowQuizForm(false);
        setNewQuiz({
          name: '',
          totalScore: 100,
          level: 'Easy',
          questions: [{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
        });
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const response = await api.delete(`/quiz/${id}`);
      if (response.data.success) {
        setQuizzes(quizzes.filter(q => q._id !== id));
      }
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  const handleAddQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[index][field] = value;
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const handleRequestRedeem = async () => {
    const points = prompt('Enter points to redeem:', '50');
    if (!points) return;

    try {
      const response = await api.post('/reward/request', {
        pointsRequested: parseInt(points)
      });
      if (response.data.success) {
        alert('Redemption request submitted!');
        setMyRequests([response.data.data, ...myRequests]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleApproveReward = async (id) => {
    const percentage = prompt('Enter Admin Percentage (0-100):', '10');
    if (percentage === null) return;

    try {
      const response = await api.post(`/reward/approve/${id}`, {
        adminPercentage: parseInt(percentage)
      });
      if (response.data.success) {
        alert('Reward approved!');
        setRewardRequests(rewardRequests.filter(req => req._id !== id));
        await refreshUser(); // Update admin points
      }
    } catch (err) {
      alert('Failed to approve reward');
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>{user?.isAdmin ? 'Admin Panel' : 'Quiz Dashboard'}</h1>
        <div className="user-info">
          <span>Logged in as: <strong>{user?.username}</strong></span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="welcome-card">
        <h2>Welcome back, {user?.username}!</h2>
        <p>Total Points: <strong>{user?.totalPoints || 0}</strong> | Quizzes Attempted: <strong>{user?.totalQuizzes || 0}</strong></p>
      </div>

      {user?.isAdmin ? (
        <div className="admin-section">
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Manage Users
            </button>
            <button 
              className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quizzes')}
            >
              Manage Quizzes
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              Reward Requests
            </button>
          </div>

          {activeTab === 'users' && (
            <>
              <h2 className="section-title">All Users</h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Points</th>
                    <th>Quizzes</th>
                    <th>Redemptions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.totalPoints}</td>
                      <td>{u.totalQuizzes}</td>
                      <td>{u.totalRedemptions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'quizzes' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title">Manage Quizzes</h2>
                <button className="add-ques-btn" onClick={() => setShowQuizForm(!showQuizForm)}>
                  {showQuizForm ? 'Cancel' : 'Add New Quiz'}
                </button>
              </div>

              {showQuizForm && (
                <form className="quiz-form-card" onSubmit={handleCreateQuiz}>
                  <h3>Create New Quiz</h3>
                  <div className="form-group">
                    <label>Quiz Name</label>
                    <input 
                      type="text" 
                      value={newQuiz.name} 
                      onChange={(e) => setNewQuiz({...newQuiz, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="stats-grid" style={{ marginBottom: '20px' }}>
                    <div className="form-group">
                      <label>Total Score</label>
                      <input 
                        type="number" 
                        value={newQuiz.totalScore} 
                        onChange={(e) => setNewQuiz({...newQuiz, totalScore: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Level</label>
                      <select 
                        value={newQuiz.level} 
                        onChange={(e) => setNewQuiz({...newQuiz, level: e.target.value})}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <h4>Questions</h4>
                  {newQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="question-form-item">
                      {newQuiz.questions.length > 1 && (
                        <button type="button" className="remove-ques" onClick={() => handleRemoveQuestion(qIdx)}>×</button>
                      )}
                      <div className="form-group">
                        <label>Question {qIdx + 1}</label>
                        <input 
                          type="text" 
                          placeholder="Enter question text"
                          value={q.questionText}
                          onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                          required
                        />
                      </div>
                      <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {q.options.map((opt, oIdx) => (
                          <input 
                            key={oIdx}
                            type="text"
                            placeholder={`Option ${oIdx + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                            required
                          />
                        ))}
                      </div>
                      <div className="form-group">
                        <label>Correct Answer</label>
                        <select 
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)}
                          required
                        >
                          <option value="">Select Correct Option</option>
                          {q.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt || `Option ${oIdx + 1}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="add-ques-btn" onClick={handleAddQuestion}>+ Add Another Question</button>
                  <button type="submit" className="save-quiz-btn">Save Quiz</button>
                </form>
              )}

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quiz Name</th>
                    <th>Level</th>
                    <th>Score</th>
                    <th>Questions</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(quiz => (
                    <tr key={quiz._id}>
                      <td>{quiz.name}</td>
                      <td>{quiz.level}</td>
                      <td>{quiz.totalScore}</td>
                      <td>{quiz.questions?.length}</td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteQuiz(quiz._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'rewards' && (
            <>
              <h2 className="section-title">Pending Reward Requests</h2>
              {rewardRequests.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Requested Points</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rewardRequests.map(req => (
                      <tr key={req._id}>
                        <td>{req.user?.username}</td>
                        <td>{req.pointsRequested}</td>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="approve-btn" onClick={() => handleApproveReward(req._id)}>Approve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No pending requests.</p>}
            </>
          )}
        </div>
      ) : (
        <div className="user-section">
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveTab('quizzes')}
            >
              Available Quizzes
            </button>
            <button 
              className={`tab-btn ${activeTab === 'attempts' ? 'active' : ''}`}
              onClick={() => setActiveTab('attempts')}
            >
              My Attempts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
              onClick={() => setActiveTab('rewards')}
            >
              Reward Requests
            </button>
          </div>

          {activeTab === 'quizzes' && (
            <>
              <h2 className="section-title">Available Quizzes</h2>
              <div className="quiz-grid">
                {quizzes.map(quiz => (
                  <div key={quiz._id} className="quiz-card">
                    <div>
                      <h3>{quiz.name}</h3>
                      <div className="quiz-meta">
                        <span>{quiz.level}</span>
                        <span>{quiz.totalScore} Points</span>
                        <span>{quiz.questions?.length} Questions</span>
                      </div>
                    </div>
                    <button className="play-btn" onClick={() => navigate(`/quiz/${quiz._id}`)}>
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'attempts' && (
            <>
              <h2 className="section-title">My Quiz Attempts</h2>
              {myAttempts.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Quiz Name</th>
                      <th>Score</th>
                      <th>Performance</th>
                      <th>Time Taken</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttempts.map(attempt => (
                      <tr key={attempt._id}>
                        <td>{attempt.quiz?.name}</td>
                        <td>{attempt.earnedScore} / {attempt.quiz?.totalScore}</td>
                        <td>{attempt.percentageAchieved}%</td>
                        <td>{attempt.timeTaken}s</td>
                        <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>You haven't attempted any quizzes yet.</p>}
            </>
          )}

          {activeTab === 'rewards' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title">My Reward Requests</h2>
                <button className="add-ques-btn" onClick={handleRequestRedeem}>
                  Request Redemption
                </button>
              </div>
              {myRequests.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Points</th>
                      <th>Status</th>
                      <th>Admin %</th>
                      <th>You Get</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map(req => (
                      <tr key={req._id}>
                        <td>{req.pointsRequested}</td>
                        <td style={{ 
                          color: req.status === 'approved' ? '#2ecc71' : req.status === 'rejected' ? '#e74c3c' : '#f39c12',
                          fontWeight: 'bold'
                        }}>
                          {req.status.toUpperCase()}
                        </td>
                        <td>{req.status === 'approved' ? `${req.adminPercentage}%` : '-'}</td>
                        <td>{req.status === 'approved' ? req.pointsToUser : '-'}</td>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No redemption requests yet.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
