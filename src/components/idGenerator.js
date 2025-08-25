// utils/idGenerator.js
export const generateDeterministicId = (data) => {
  // Create a string representation of the data
  const dataString = JSON.stringify(data);
  
  // Simple hash function (you can use a more robust one if needed)
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to a 4-character base36 string
  return Math.abs(hash).toString(36).substring(0, 4).toUpperCase();
};