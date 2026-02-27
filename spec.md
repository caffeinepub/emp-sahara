# EMP Sahara

## Current State
The app is a multi-role winery staff management app with:
- Role-based access: employee, supervisor, management
- Leave management: employees can view leave balances (sick, casual, earned, emergency)
- Management can update leave balances for any employee via `updateLeaveBalance(employeeId, sick, casual, earned, emergency)` -- currently done via a dialog in ProfilePage where managers must type in the employee's Principal ID manually
- No way for managers to browse employees and directly edit their leave from a list view
- `getLeaveBalanceForPrincipal(employeeId)` exists to fetch leave balance for any given principal
- `useLeaderboard()` provides all employee data (principal, name, nameHindi, branch)

## Requested Changes (Diff)

### Add
- A "Manage Employee Leaves" panel in the management section of ProfilePage (or as a new tab in ManagementPanel)
- An employee list view where manager can see all employees (sourced from leaderboard data) with their current leave balances
- Inline or dialog-based leave editing per employee: manager clicks an employee, sees their current leave (sick/casual/earned/emergency), can modify values, add a note/reason, and save
- Hindi/English bilingual labels throughout

### Modify
- ProfilePage management section: replace/extend the existing `UpdateLeaveDialog` (which requires manual Principal entry) with the new employee-list-based leave editor
- The existing raw `UpdateLeaveDialog` can remain but should be supplemented with the friendlier list-based approach

### Remove
- Nothing removed

## Implementation Plan
1. Add `useGetLeaveBalanceForPrincipal` hook in `useQueries.ts` (wraps `getLeaveBalanceForPrincipal`)
2. Create a `ManageLeavePanel` component (or section inside ProfilePage) that:
   - Loads all employees from `useLeaderboard()`
   - For each employee, shows name, branch, and a button to edit leaves
   - On clicking edit, opens a dialog/sheet showing current leave balances (loaded via `useGetLeaveBalanceForPrincipal`)
   - Manager can update sick/casual/earned/emergency values + optional reason note
   - On save, calls `useUpdateLeaveBalance`
3. Wire the new component into ProfilePage under the management tools section

## UX Notes
- Employee list should be searchable/filterable by branch
- Leave values shown in colored tiles matching existing LeaveBalanceCard style
- Reason/note field is optional but encouraged
- Full Hindi/English bilingual labels using existing `useLang` pattern
- Large tap targets for mobile use
