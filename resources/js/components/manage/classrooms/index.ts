// Main components
export { default as ClassroomTable } from './classroom-table';
export { default as ClassroomForm } from './classroom-form';
export { default as ClassroomFilterBar } from './classroom-filter-bar';

// Default export for backward compatibility
export { default } from './classroom-form';

// Types
export type { ClassroomListItem, ClassroomStaff, ClassroomFormData } from './types';
export type { ClassroomFilterState } from './classroom-filter-bar';

// Utility functions
export { resolveLocalizedText, formatCapacity, formatLocation } from './utils';
