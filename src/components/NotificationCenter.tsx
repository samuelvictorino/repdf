import React from 'react';
import Icon from './icons/Icon';
import type { Notification } from '../types/notifications';

interface NotificationCenterProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-500 text-success-700 dark:bg-success-900/20 dark:border-success-400 dark:text-success-200';
      case 'error':
        return 'bg-error-50 border-error-500 text-error-700 dark:bg-error-900/20 dark:border-error-400 dark:text-error-200';
      case 'warning':
        return 'bg-warning-50 border-warning-500 text-warning-700 dark:bg-warning-900/20 dark:border-warning-400 dark:text-warning-200';
      case 'info':
        return 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:border-primary-400 dark:text-primary-200';
      default:
        return 'bg-bg-secondary border-border text-text-primary';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'exclamation-triangle';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            surface-elevated border-l-4 p-4 rounded-lg transform transition-all duration-300 ease-in-out animate-slide-up
            ${getNotificationStyles(notification.type)}
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <Icon 
                name={getIcon(notification.type)} 
                size="sm" 
                className="text-current"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight">
                {notification.title}
              </h4>
              <p className="text-sm mt-1 opacity-90 leading-relaxed">
                {notification.message}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => onRemove(notification.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-20"
              title="Fechar notificação"
            >
              <Icon name="x-mark" size="xs" className="text-current opacity-60 hover:opacity-100" />
            </button>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          {notification.duration && (
            <div className="mt-3 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current opacity-30 rounded-full animate-shrink-width"
                style={{
                  animationDuration: `${notification.duration}ms`,
                  animationTimingFunction: 'linear'
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;