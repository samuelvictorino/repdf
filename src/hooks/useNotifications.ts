import { useCallback, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Notification, NotificationState, NotificationAction, NotificationType } from '../types/notifications';

const initialState: NotificationState = {
  notifications: [],
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: uuidv4(),
        timestamp: Date.now(),
      };
      return {
        ...state,
        notifications: [...state.notifications, newNotification],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
};

export const useNotifications = () => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type, title, message, duration },
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  // Auto-dismiss notifications with duration
  useEffect(() => {
    const timers: number[] = [];
    
    state.notifications.forEach(notification => {
      if (notification.duration) {
        const timer = window.setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, [state.notifications, removeNotification]);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, duration = 4000) => {
    addNotification('success', title, message, duration);
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    addNotification('error', title, message, duration);
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, duration = 6000) => {
    addNotification('warning', title, message, duration);
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, duration = 4000) => {
    addNotification('info', title, message, duration);
  }, [addNotification]);

  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};