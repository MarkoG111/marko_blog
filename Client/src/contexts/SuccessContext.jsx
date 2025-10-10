import { createContext, useState, useContext } from 'react'
import PropTypes from 'prop-types'

const SuccessContext = createContext()

export const useSuccess = () => useContext(SuccessContext)

export const SuccessProvider = ({ children }) => {
  const [successMessages, setSuccessMessages] = useState([])

  const showSuccess = (message) => {
    const id = `${Date.now()}-${Math.random()}`
    setSuccessMessages((prevMessages) => [...prevMessages, { id, message, fading: false }])

    setTimeout(() => {
      setSuccessMessages((prevMessages) => prevMessages.map((message) => message.id === id ? { ...message, fading: true } : message))
    }, 3500)

    setTimeout(() => {
      setSuccessMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== id)
      )
    }, 7000)
  }

  return (
    <SuccessContext.Provider value={{ showSuccess }}>
      {children}

      {successMessages.map((success, index) => (
        <div
          key={success.id}
          className={`fixed top-32 right-4 bg-green-600 text-white p-4 rounded shadow-lg z-50 ease-in-out ${success.fading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
          style={{
            top: `${32 + index * 80}px`,
            transform: 'translateY(0)',
          }}
        >
          <p>{success.message}</p>
        </div>
      ))}
    </SuccessContext.Provider>
  )
}

SuccessProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
