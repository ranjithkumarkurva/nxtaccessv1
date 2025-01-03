import React from 'react'
import Header from '../HeaderRouter'

const FailureView = ({onRetry}) => (
  <div>
    <Header />
    {/* Main Content */}
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="bg-white rounded-lg shadow-sm p-8 w-full max-w-lg text-center">
        <img
          src="/api/placeholder/400/300"
          alt="Something went wrong"
          className="mx-auto mb-8 w-96"
        />

        <h2 className="text-2xl font-medium text-gray-800 mb-3">
          Oops! Something went wrong
        </h2>

        <p className="text-gray-600 mb-8">We are having some trouble</p>

        <button
          type="button"
          onClick={onRetry}
          className="bg-[#2E4374] text-white px-8 py-2 rounded hover:bg-opacity-90 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
)

export default FailureView
