import { createContext, useState, useContext } from 'react'
import PropTypes from 'prop-types'

const ErrorContext = createContext()

export const useError = () => useContext(ErrorContext)

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([])

  const showError = (message) => {
    const id = `${Date.now()}-${Math.random()}`
    setErrors((prevErrors) => [...prevErrors, { id, message, fading: false }])

    setTimeout(() => {
      setErrors((prevErrors) => prevErrors.map((error) => error.id === id ? { ...error, fading: true } : error))
    }, 3500)

    setTimeout(() => {
      setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id))
    }, 4000)
  }

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}

      {errors.map((error, index) => (
        <div
          key={error.id}
          className={`fixed top-32 right-4 bg-red-600 text-white p-4 rounded shadow-lg z-50 transition-all duration-500 ease-in-out ${error.fading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
          style={{
            top: `${32 + index * 80}px`, 
          }}
        >
          <p>{error.message}</p>
        </div>
      ))}
    </ErrorContext.Provider>
  )
}


ErrorProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
