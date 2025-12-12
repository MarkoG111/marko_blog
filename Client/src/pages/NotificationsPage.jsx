import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { timeAgo, hoverActualDate } from "../utils/timeAgo";
import {
    markAllAsRead,
} from "../redux/notification/notificationsSlice";
import { markAllNotificationsAsRead } from "../api/notificationsApi";

export default function NotificationsPage() {
    const [type, setType] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const notifications = useSelector(
        state => state.notifications?.items ?? []
    );

    // Auto mark ALL as read when page opens
    useEffect(() => {
        if (notifications.length === 0) return;
        if (!notifications.some(n => !n.isRead)) return;

        dispatch(markAllAsRead());
        markAllNotificationsAsRead().catch(console.error);
    }, [notifications, dispatch]);

    const sortedNotifications = useMemo(
        () =>
            [...notifications].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            ),
        [notifications]
    );

    const filteredNotifications = useMemo(
        () =>
            type
                ? sortedNotifications.filter(n => n.type === type)
                : sortedNotifications,
        [sortedNotifications, type]
    );

    const handleNotificationClick = (notification) => {
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="flex flex-col h-full md:flex-row md:h-screen bg-gray-100 dark:bg-gray-800 px-4 lg:px-96 pt-2 pb-24">

            {/* Sidebar */}
            <div className="flex flex-col p-4 md:w-1/4 bg-white dark:bg-gray-800 shadow-lg border-r rounded-md">
                <h1 className="text-2xl font-bold mb-4">Notifications</h1>
                <ul className="space-y-2">
                    {[
                        { label: "All", value: null },
                        { label: "Posts", value: 1 },
                        { label: "Comments", value: 2 },
                        { label: "Likes", value: 3 }
                    ].map(item => (
                        <li
                            key={item.label}
                            onClick={() => setType(item.value)}
                            className={`cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-indigo-600
                ${type === item.value
                                    ? "bg-gray-100 dark:bg-indigo-700 text-blue-300"
                                    : ""}`}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 bg-white dark:bg-gray-800 overflow-y-auto rounded-md">
                <div className="space-y-4 mt-4">
                    {filteredNotifications.length === 0 ? (
                        <p>No notifications...</p>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 border-b rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700
                  ${notification.isRead
                                        ? "border-gray-300"
                                        : "border-blue-500"}`}
                            >
                                <p className="text-gray-700 dark:text-white">
                                    {notification.content}
                                </p>
                                <p
                                    className="text-sm text-gray-500"
                                    title={hoverActualDate(notification.createdAt)}
                                >
                                    {timeAgo(notification.createdAt)}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
