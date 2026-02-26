# EMP Sahara

## Current State
Phase 1 is live with: role-based login (employee/supervisor/management), attendance check-in/check-out, task management, reward points with leaderboard, announcements, leave balance, branch management (add/edit/delete), and employee profile. The app supports Hindi/English toggle. GPS-based attendance was planned but not yet in the existing backend (checkIn/checkOut are stubs).

## Requested Changes (Diff)

### Add
1. **Digital ID Card system** -- employees can request a Digital ID; management approves/rejects with reason; approved IDs display employee photo (placeholder), full name, designation, employee ID, department, branch, "GFF&B Pvt LTD" branding, and validity date; ID is viewable only inside the app (no external sharing); auto-deactivated when user is deactivated.
2. **Employee registration with management approval** -- a new user can register/request an account; their request is queued for management approval; only after approval are they activated and able to log in fully.
3. **Management: All-employee attendance view** -- management can see real-time attendance status of all employees across all branches (or filtered by branch), showing today's check-in/check-out status and attendance status per employee.

### Modify
- Backend: Add `DigitalIdRequest` and `DigitalIdCard` types; add endpoints for requesting, approving/rejecting, and fetching Digital ID cards.
- Backend: Add `EmployeeRegistration` request type; add endpoints for submitting a registration request and management approving/rejecting it.
- Backend: Enhance attendance storage so `checkIn`/`checkOut` actually store timestamps and GPS coordinates; add `getAllEmployeesAttendanceToday` endpoint for management.
- Frontend: Add "My Digital ID" section to employee Profile page.
- Frontend: Add "Digital ID Requests" tab to management section.
- Frontend: Add "All Attendance" view for management on the Attendance page.

### Remove
- Nothing removed.

## Implementation Plan
1. Generate updated backend with Digital ID types, employee registration queue, and real attendance storage with management all-attendance query.
2. Build frontend:
   - Employee "Request Digital ID" form and "My Digital ID" card view on Profile page.
   - Management "Digital ID Requests" panel (approve/reject with reason).
   - Employee registration/onboarding flow for new users (request account, pending approval screen).
   - Management panel to review and approve pending employee registrations.
   - Management "All Attendance Today" view on Attendance page with branch filter.

## UX Notes
- Digital ID card should look like a physical badge: company name "GFF&B Pvt LTD" at top, employee photo placeholder, name, designation, department, branch, employee ID, validity date.
- Hindi/English toggle must apply to all new screens.
- Management attendance view: table or card list showing each employee's name, branch, department, today's check-in time, check-out time, and status badge (Present/Absent/Late/On Leave).
- Registration pending screen: friendly message in both languages telling the employee their account is awaiting management approval.
- Keep UI consistent with existing Phase 1 design (large buttons, color coding green/yellow/red).
