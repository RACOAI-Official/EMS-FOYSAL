/**
 * Centralized utility to handle report printing in a new tab.
 * Saves the configuration to localStorage and opens the /print-report route.
 */
export const exportToPrint = (config) => {
  // Add a timestamp to ensure uniqueness if needed
  const printConfig = {
    ...config,
    timestamp: new Date().getTime()
  };
  localStorage.setItem('printData', JSON.stringify(printConfig));
  window.open('/print-report', '_blank');
};
