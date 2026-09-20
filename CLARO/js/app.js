window.addEventListener('error', (e) => {
  // Log nicely for debugging
  console.error('CLARO error:', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('CLARO unhandled promise rejection:', e.reason);
});