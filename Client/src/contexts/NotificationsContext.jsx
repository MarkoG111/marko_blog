import PropTypes from 'prop-types'
import React, { createContext, useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setUnreadCount } from "../redux/notification/notificationsSlice"
import { useLocation } from "react-router-dom"
import { useError } from "./ErrorContext"
import { handleApiError } from "../utils/handleApiUtils"
import * as signalR from '@microsoft/signalr'

export const NotificationsContext = createContext()

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [hasNewNotifications, setHasNewNotifications] = useState(false)

  const { currentUser } = useSelector((state) => state.user)

  const location = useLocation()

  const dispatch = useDispatch()

  const connection = useRef(null)
  const isConnecting = useRef(false)

  const { showError } = useError()

  // Use useCallback to memoize updateUnreadCount
  const updateUnreadCount = useCallback((notifications) => {
    const newUnreadCount = notifications.filter((n) => !n.isRead).length
    setHasNewNotifications(newUnreadCount > 0)
    dispatch(setUnreadCount(newUnreadCount))
  }, [dispatch])

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?.id) return

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          showError("Token not found")
          return
        }

        const response = await fetch(`/api/notifications`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()

          setNotifications(data.items)
          updateUnreadCount(data.items)
        } else {
          await handleApiError(response, showError)
        }
      } catch (error) {
        showError(error.message)
      }
    }

    fetchNotifications()
  }, [currentUser, dispatch, updateUnreadCount, showError])

  const debounce = (func, delay) => {
    let timer

    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => func(...args), delay)
    }
  }

  const handleNewNotification = debounce((notification) => {
    setNotifications((prev) => {
      const isDuplicate = prev.some((n) => n.id === notification.id)

      if (isDuplicate) {
        return prev
      }

      const updatedNotifications = [notification, ...prev]
      updateUnreadCount(updatedNotifications)

      return updatedNotifications
    })
  }, 300)

  useEffect(() => {
    const startSignalRConnection = async () => {
      if (isConnecting.current || connection.current) {
        return
      }

      isConnecting.current = true

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          showError("Token not found")
          return
        }

        const hubConnection = new signalR.HubConnectionBuilder()
          .withUrl("/api/notificationsHub", {
            accessTokenFactory: () => token,
          })
          .configureLogging(signalR.LogLevel.Information)
          .withAutomaticReconnect([0, 2000, 10000, 30000])
          .build()

        hubConnection.onreconnecting(error => {
          console.log("Reconnecting due to error:", error)
        })

        hubConnection.onreconnected(connectionId => {
          console.log("Reconnected. New connection ID:", connectionId)
        })

        hubConnection.on("ReceiveNotification", handleNewNotification)

        await hubConnection.start()
        console.log("SignalR connected")

        await hubConnection.invoke("JoinGroup", currentUser.id.toString())

        connection.current = hubConnection
      } catch (error) {
        showError(error.message)
      } finally {
        isConnecting.current = false
      }
    }

    // ?
    if (currentUser?.roleName === "Author" && currentUser?.id) {
      startSignalRConnection()
    }

    return () => {
      if (connection.current) {
        connection.current.stop().catch((error) => console.log("Error stopping connection:", error))
        connection.current = null
      }
    }
  }, [currentUser, updateUnreadCount, showError])

  useEffect(() => {
    if (location.pathname == "/notifications") {
      const markAllAsReadOnPageChange = async () => {
        setNotifications((prevNotifications) => prevNotifications.map((notification) => ({ ...notification, isRead: true })))

        try {
          const token = localStorage.getItem("token")
          if (!token) {
            showError("Token not found")
            return
          }

          await fetch(`/api/notifications/mark-as-read`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          setHasNewNotifications(false)
          dispatch(setUnreadCount(0))
        } catch (error) {
          showError(error.message)
        }
      }

      markAllAsReadOnPageChange()
    }
  }, [location.pathname, dispatch, showError])

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications, hasNewNotifications }}>
      {children}
    </NotificationsContext.Provider>
  )
}

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired
}