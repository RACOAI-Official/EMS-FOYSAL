import { backendUrl } from '../http';

/**
 * Resolves a file path to a full URL.
 * Handles both absolute URLs (e.g., Cloudinary) and local relative paths.
 * 
 * @param {string} path - The file path or URL from the database.
 * @param {string} defaultAsset - The default asset to return if path is empty.
 * @returns {string} - The full URL to the asset.
 */
export const getFileUrl = (path, defaultAsset = '/assets/icons/user.png') => {
  if (!path || path === 'user.png' || path === 'team.png') {
    return defaultAsset;
  }

  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }

  // Handle local storage paths
  // If path already starts with storage/, don't double it
  if (path.startsWith('storage/')) {
    return `${backendUrl}/${path}`;
  }

  return `${backendUrl}/storage/${path}`;
};
