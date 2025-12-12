import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: {
        items: [],
        unreadCount: 0
    },
    reducers: {
        setNotifications(state, action) {
            state.items = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
        },

        addNotification(state, action) {
            if (state.items.some(n => n.id === action.payload.id)) {
                return;
            }

            state.items.unshift(action.payload);
            state.unreadCount++;
        },

        markAllAsRead(state) {
            state.items.forEach(n => {
                n.isRead = true;
            });
            state.unreadCount = 0;
        }
    }
});

export const {
    setNotifications,
    addNotification,
    markAllAsRead
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
