# EMP Sahara

## Current State
The app has: login/registration with management approval, attendance (GPS-gated), task management, reward points, digital ID cards, announcements (management sends to branches), leave management, and branch CRUD. No file/document sharing system exists.

## Requested Changes (Diff)

### Add
- **Important Files** section: managers and supervisors can upload files (PDF, JPG, PNG, other docs) organized into custom categories
- Custom categories: managers can create, name, and delete categories
- Access control per category: manager sets which roles can view each category (employee / supervisor / management)
- All users see only files in categories they are allowed to access
- Files stored as base64 blobs in the backend with metadata (name, type, size, category, uploader, timestamp)
- File listing with download support
- Hindi + English labels throughout

### Modify
- Backend: add `FileCategory`, `FileRecord` types; add functions for category management and file management
- Frontend: add "Important Files" tab/page accessible from main navigation

### Remove
- Nothing removed

## Implementation Plan
1. Generate backend with new `FileCategory` (id, name, allowedRoles, createdBy) and `FileRecord` (id, categoryId, fileName, fileType, fileData blob, uploadedBy, uploadedAt) types
2. Add backend functions: createCategory, updateCategory, deleteCategory, getCategories, uploadFile, deleteFile, getFilesForCategory
3. Delegate frontend to build ImportantFilesPage with: category management panel (managers only), file upload (managers + supervisors), file list with download, role-filtered view

## UX Notes
- Large tap targets for glove-friendly use
- Color indicators: green = accessible, yellow = restricted
- Hindi/English toggle consistent with rest of app
- Categories shown as collapsible sections
- File cards show: name, type icon, uploader name, upload date, download button
- Management sees "Manage Categories" button; supervisors see upload only; employees see read-only
