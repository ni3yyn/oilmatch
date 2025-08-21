// src/utils/generateOrderId.js
export const generateOrderId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `OIL${timestamp}${randomStr}`.toUpperCase();
  };