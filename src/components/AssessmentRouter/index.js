/* eslint-disable react/no-array-index-key */
import React, {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import Header from '../HeaderRouter'
import './index.css'

class Assessment extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentQuestionIndex: 0,
      timeLeft: 600,
      answers: {},
      questionsData: [],
      score: 0, // Add score to the state
      submitting: false,
      isLoading: true,
      error: null,
    }
    this.timerID = null
  }

  componentDidMount() {
    this.getQuestionDetails()
    this.startTimer()
  }

  componentWillUnmount() {
    if (this.timerID) {
      clearInterval(this.timerID)
    }
  }

  clearTimerAndSubmit = () => {
    if (this.timerID) {
      clearInterval(this.timerID)
    }
    if (!this.submitting) {
      this.handleTimeUp()
    }
  }

  startTimer = () => {
    this.timerID = setInterval(() => {
      this.setState(prevState => {
        const newTimeLeft = prevState.timeLeft - 1
        if (newTimeLeft <= 0) {
          clearInterval(this.timerID)
          this.handleTimeUp()
          return {timeLeft: 0}
        }
        return {timeLeft: newTimeLeft}
      })
    }, 1000)
  }

  handleTimeUp = () => {
    const {history} = this.props
    const {answers, questionsData, submitting} = this.state

    if (submitting) {
      return
    }

    this.setState({submitting: true})
    clearInterval(this.timerID)

    const score = this.calculateScore(answers, questionsData)
    history.replace('/time-up', {
      score,
      isTimeUp: true,
      timeTaken: 600, // Total time taken when time is up
    })
  }

  calculateScore = (answers, questionsData) => {
    let score = 0
    questionsData.forEach(question => {
      const correctOption = question.options.find(
        option => option.is_correct === 'true',
      )
      if (answers[question.id] === correctOption.id) {
        score += 1
      }
    })
    return score
  }

  calculateTimeTaken = () => {
    const {timeLeft} = this.state
    const timeSpent = 600 - timeLeft // 600 seconds = 10 minutes
    const minutes = Math.floor(timeSpent / 60)
    const seconds = timeSpent % 60
    return `${minutes}m ${seconds}s`
  }

  formatTime = seconds => {
    if (seconds <= 0) return '00:00'
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
    return `${minutes}:${remainingSeconds}`
  }

  getQuestionDetails = async () => {
    this.setState({isLoading: true, error: null})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/assess/questions'

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data = await response.json()
      const initialAnswers = {}
      //   data.questions.forEach(question => {
      //     if (question.options_type === 'SINGLE_SELECT') {
      //       initialAnswers[question.id] = question.options[0].id
      //     }
      //   })

      this.setState({
        questionsData: data.questions,
        isLoading: false,
        answers: initialAnswers,
      })
    } catch (error) {
      this.setState({
        error: 'Failed to load questions. Please try again.',
        isLoading: false,
      })
    }
  }

  handleOptionClick = (option, questionId) => {
    this.setState(prevState => {
      const question = prevState.questionsData.find(q => q.id === questionId)
      const correctOption = question.options.find(
        opt => opt.is_correct === 'true',
      )
      const isCorrect = option.id === correctOption.id
      const newScore = isCorrect ? prevState.score + 1 : prevState.score

      return {
        answers: {
          ...prevState.answers,
          [questionId]: option.id,
        },
        score: newScore,
      }
    })
  }

  renderDefaultOptions = (options, questionId) => {
    const {answers} = this.state
    return (
      <div className="options-container">
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            className={`option-button ${
              answers[questionId] === option.id ? 'option-button--selected' : ''
            }`}
            onClick={() => this.handleOptionClick(option, questionId)}
          >
            {option.text}
          </button>
        ))}
      </div>
    )
  }

  renderImageOptions = (options, questionId) => {
    const {answers} = this.state
    return (
      <div className="image-options-grid">
        {options.map(option => (
          <div
            key={option.id}
            className={`image-option ${
              answers[questionId] === option.id ? 'image-option--selected' : ''
            }`}
            onClick={() => this.handleOptionClick(option, questionId)}
            role="button"
            tabIndex={0}
          >
            <img src={option.image_url} alt={option.text} />
            <p className="option-label">{option.text}</p>
          </div>
        ))}
      </div>
    )
  }

  renderSingleSelect = (options, questionId) => {
    const {answers} = this.state
    return (
      <div className="select-container">
        <select
          className="select-input"
          value={answers[questionId] || ''}
          onChange={e => {
            const selectedOption = options.find(
              opt => opt.id === e.target.value,
            )
            if (selectedOption) {
              this.handleOptionClick(selectedOption, questionId)
            }
          }}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
    )
  }

  handleQuestionChange = index => {
    this.setState({currentQuestionIndex: index})
  }

  handleSubmitAssessment = () => {
    const {history} = this.props
    const {answers, questionsData, score, timeLeft} = this.state

    this.setState({submitting: true})
    clearInterval(this.timerID)

    const timeTaken = 600 - timeLeft // Calculate time taken

    history.replace('/results', {
      score,
      isTimeUp: false,
      timeTaken, // Pass timeTaken to the results route
    })
  }

  renderQuestions = () => {
    const {questionsData, currentQuestionIndex} = this.state
    const question = questionsData[currentQuestionIndex]

    if (!question) return null

    return (
      <div className="question-container" data-testid="questionItem">
        <h3 className="question-number">
          Question {currentQuestionIndex + 1} of {questionsData.length}
        </h3>
        <p className="question-text">{question.question_text}</p>

        {question.options_type === 'DEFAULT' &&
          this.renderDefaultOptions(question.options, question.id)}
        {question.options_type === 'IMAGE' &&
          this.renderImageOptions(question.options, question.id)}
        {question.options_type === 'SINGLE_SELECT' &&
          this.renderSingleSelect(question.options, question.id)}

        {currentQuestionIndex < questionsData.length - 1 && (
          <button
            type="button"
            className="next-button"
            onClick={() => this.handleQuestionChange(currentQuestionIndex + 1)}
          >
            Next Question
          </button>
        )}
      </div>
    )
  }

  render() {
    const {
      questionsData,
      answers,
      isLoading,
      error,
      currentQuestionIndex,
      timeLeft,
    } = this.state

    if (isLoading) {
      return (
        <div className="loader-container" data-testid="loader">
          <Loader type="ThreeDots" color="#263868" height={50} width={50} />
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
            alt="failure view"
          />
          <p>{error}</p>
          <button
            type="button"
            className="retry-button"
            onClick={this.getQuestionDetails}
          >
            Retry
          </button>
        </div>
      )
    }

    const answeredCount = Object.keys(answers).length
    const unansweredCount = questionsData.length - answeredCount

    return (
      <div className="main-assessment-container">
        <div className="assessment-container">
          {this.renderQuestions()}

          <div className="sidebar">
            <div className="timer-section">
              <p className="time-left">Time Left</p>
              <div className="timer-display">
                <span>{this.formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="questions-status">
              <div className="status-item">
                <span className="status-count answered">{answeredCount}</span>
                <span className="status-label">Answered Questions</span>
              </div>
              <div className="status-item">
                <span className="status-count unanswered">
                  {unansweredCount}
                </span>
                <span className="status-label">Unanswered Questions</span>
              </div>
            </div>

            <div className="questions-section">
              <p className="questions-title">
                Questions ({questionsData.length})
              </p>
              <div className="questions-grid">
                {questionsData.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`question-number-button ${
                      index === currentQuestionIndex
                        ? 'question-number-button--active'
                        : ''
                    } ${
                      answers[questionsData[index]?.id]
                        ? 'question-number-button--answered'
                        : ''
                    }`}
                    onClick={() => this.handleQuestionChange(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="submit-button"
              onClick={this.handleSubmitAssessment}
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Assessment
