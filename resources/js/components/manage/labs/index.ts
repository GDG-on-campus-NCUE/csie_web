// Main components
export { default as LabTable } from './lab-table';
export { default as LabForm } from './lab-form';
export { default as LabFilterBar } from './lab-filter-bar';

// Default export for backward compatibility
export { default } from './lab-form';

// Types
export type { LabListItem, LabTeacher, LabFormData } from './types';
export type { LabFilterState } from './lab-filter-bar';

// Utility functions
export { resolveLocalizedText, fallbackInitials } from './utils';
