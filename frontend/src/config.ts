// Centralized configuration for the application
// In production, VITE_API_URL should be set in environment variables
// In development, it falls back to localhost:5050

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";
export const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5050";
