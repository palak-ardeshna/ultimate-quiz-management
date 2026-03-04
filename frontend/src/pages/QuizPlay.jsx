import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './QuizPlay.scss';

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quiz/${id}`);
        if (response.data.success) {
          setQuiz(response.data.data);
          // Start timer
          timerRef.current = setInterval(() => {
            setTimer(prev => prev + 1);
          }, 1000);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to load quiz');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, navigate]);

  const handleOptionSelect = (option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: option
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      const response = await api.post('/user-quiz/submit', {
        quizId: id,
        timeTaken: timer
      });

      if (response.data.success) {
        setResult(response.data.data);
        setFinished(true);
        await refreshUser(); // Update points in context
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit quiz');
    }
  };

  if (loading) return <div className="loading">Loading Quiz...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  if (finished) {
    return (
      <div className="quiz-play-container">
        <div className="result-card">
          <h2>Quiz Completed!</h2>
          <div className="score-circle">
            <span className="score-val">{result.earnedScore}</span>
            <span>Points</span>
          </div>
          <p>Time Taken: <strong>{result.timeTaken} seconds</strong></p>
          <p>Performance: <strong>{result.percentageAchieved}%</strong></p>
          <button className="auth-button" style={{marginTop: '30px'}} onClick={() => navigate('/')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="quiz-play-container">
      <div className="quiz-info">
        <h2>{quiz.name}</h2>
        <div className="timer">⏱️ {timer}s</div>
      </div>

      <div className="question-card">
        <p className="question-count">Question {currentQuestion + 1} of {quiz.questions.length}</p>
        <h3>{question.questionText}</h3>
        
        <div className="options-grid">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedAnswers[currentQuestion] === option ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="quiz-footer">
        <button 
          className="auth-button" 
          style={{background: '#666'}} 
          disabled={currentQuestion === 0} 
          onClick={handlePrev}
        >
          Previous
        </button>
        
        {currentQuestion === quiz.questions.length - 1 ? (
          <button className="submit-btn" onClick={handleSubmit}>Finish Quiz</button>
        ) : (
          <button className="auth-button" onClick={handleNext}>Next Question</button>
        )}
      </div>
    </div>
  );
};

export default QuizPlay;
