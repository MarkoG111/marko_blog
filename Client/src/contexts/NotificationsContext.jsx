import PropTypes from "prop-types";
import React, { createContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { NotificationsService } from "../services/notificationsService";
import { setUnreadCount } from "../redux/notification/notificationsSlice";
import { useError } from "./ErrorContext";

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const { showError } = useError();
  const dispatch = useDispatch();

  const serviceRef = useRef(NotificationsService());

  const updateCount = (items) => {
    const unread = items.filter((n) => !n.isRead).length;
    dispatch(setUnreadCount(unread));
    setHasNewNotifications(unread > 0);
  };

  // REST: Initial fetch
  useEffect(() => {
    if (!currentUser?.id) return;

    serviceRef.current
      .getNotifications()
      .then((data) => {
        setNotifications(data.items);
        updateCount(data.items);
      })
      .catch((err) => showError(err.message));
  }, [currentUser]);

  // REAL-TIME
  useEffect(() => {
    if (!currentUser?.id) return;

    const token = localStorage.getItem("token");

    const handleReceive = (notif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notif.id)) return prev;

        const updated = [notif, ...prev];
        updateCount(updated);
        return updated;
      });
    };

    serviceRef.current
      .initSignalR({
        token,
        userId: currentUser.id,
        onReceive: handleReceive,
      })
      .catch((err) => showError(err.message));

    return () => serviceRef.current.cleanupSignalR();
  }, [currentUser]);

  // AUTO MARK AS READ ON PAGE VISIT
  useEffect(() => {
    if (location.pathname !== "/notifications") return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );

    serviceRef.current
      .markAllNotificationsAsRead()
      .then(() => {
        dispatch(setUnreadCount(0));
        setHasNewNotifications(false);
      })
      .catch((err) => showError(err.message));
  }, [location.pathname]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, setNotifications, hasNewNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
