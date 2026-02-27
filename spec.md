# EMP Sahara

## Current State
- Full employee management app with roles: employee, supervisor, management
- Registration via RegistrationRequestPage (requires management approval)
- Management role was missing from the signup dropdown (now fixed)
- No first-run setup: the very first person has no way to claim management role without another manager approving them

## Requested Changes (Diff)

### Add
- Backend: `isFirstRun()` query — returns true if no user profiles exist yet
- Backend: `claimFirstRunAdmin(name, nameHindi, employeeId, phone, branch)` mutation — creates the first user directly as management role; fails if any profiles already exist
- Frontend: `FirstRunSetupPage` — a friendly setup screen shown only when `isFirstRun` returns true; collects name (English + Hindi), employee ID, phone, branch name; on submit calls `claimFirstRunAdmin` and proceeds into the app
- Frontend: Wire `isFirstRun` check into `App.tsx` routing so it shows `FirstRunSetupPage` before the normal login/registration flow when applicable

### Modify
- `App.tsx`: add first-run check; if `isFirstRun` is true and user is authenticated but has no profile, show `FirstRunSetupPage` instead of `RegistrationRequestPage`
- `RegistrationRequestPage.tsx`: management role option already added (done)

### Remove
- Nothing

## Implementation Plan
1. Generate updated Motoko backend with `isFirstRun` and `claimFirstRunAdmin` functions
2. Add `useIsFirstRun` and `useClaimFirstRunAdmin` hooks in `useQueries.ts`
3. Create `FirstRunSetupPage.tsx` with bilingual form
4. Update `App.tsx` routing to check first-run state

## UX Notes
- First-run screen should feel welcoming and explain this is the initial admin setup
- Show in both Hindi and English
- After claiming, user goes straight into the app as management
- Branch field: free-text input since no branches exist yet at first run
