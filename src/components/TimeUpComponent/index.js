import React from 'react'
import {useNavigate} from 'react-router-dom'

import Header from '../HeaderRouter'

const TimeUpComponent = ({score}) => {
  const navigate = useNavigate()

  const handleReattempt = () => {
    navigate('/assessment')
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />

      {/* Main Content */}
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-lg text-center">
          <img
            src="/api/placeholder/300/200"
            alt="Time up illustration"
            className="mx-auto mb-6 w-72"
          />

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Time is up
          </h2>

          <p className="text-gray-600 mb-6">
            You did not complete the assessment within the time.
          </p>

          <div className="mb-8">
            <p className="text-lg text-gray-700">
              Your Score:{score}
              <span className="text-[#2E4374] text-2xl font-bold ml-2">2</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleReattempt}
            className="bg-[#2E4374] text-white px-6 py-2 rounded hover:bg-opacity-90 transition-colors"
          >
            Reattempt
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimeUpComponent
