/**
 * Base Path Utility
 * Automatically detects the base path for navigation
 * Works both in local dev (/) and GitHub Pages (/Perpepong/)
 */

// Detect base path from current URL
// If we're at nicoloddo.github.io/Perpepong/..., base path is /Perpepong/
// If we're at localhost:8000/..., base path is /
function getBasePath() {
  const path = window.location.pathname;
  
  // Check if we're on GitHub Pages (contains /Perpepong/)
  if (path.includes('/Perpepong/')) {
    return '/Perpepong';
  }
  
  // Local development or root deployment
  return '';
}

// Export for use in other modules
window.BASE_PATH = getBasePath();

// Helper function to create absolute paths with base
window.getPath = function(path) {
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return window.BASE_PATH + path;
};

