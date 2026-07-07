import React from 'react';
import './Notification.css';

function Notification({ message, type = 'info' }) {
  return <div className={`notification notification-${type}`}>{message}</div>;
}

export default Notification;
