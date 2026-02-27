import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    principal: Principal;
    branch: string;
    nameHindi: string;
    name: string;
    rank: bigint;
    points: bigint;
}
export type Time = bigint;
export interface FileCategory {
    id: bigint;
    name: string;
    createdBy: Principal;
    allowedRoles: Array<Role>;
}
export interface Task {
    id: bigint;
    status: TaskStatus;
    descriptionHindi: string;
    title: string;
    branch: string;
    completionNote?: string;
    assignedTo: Principal;
    titleHindi: string;
    dueDate: Time;
    description: string;
    approvalReason?: string;
    approved?: boolean;
    priority: TaskPriority;
}
export interface Branch {
    id: bigint;
    name: string;
}
export interface FileRecord {
    id: bigint;
    categoryId: bigint;
    fileData: Uint8Array;
    fileName: string;
    fileType: string;
    uploadedAt: Time;
    uploadedBy: Principal;
}
export interface RegistrationRequest {
    status: Variant_pending_approved_rejected;
    branch: string;
    requester: Principal;
    nameHindi: string;
    rejectedReason?: string;
    name: string;
    role: Role;
    employeeId: string;
    phone: string;
    department: string;
}
export interface AttendanceRecord {
    status: AttendanceStatus;
    checkIn?: Time;
    date: string;
    checkOut?: Time;
}
export interface Announcement {
    id: bigint;
    title: string;
    titleHindi: string;
    body: string;
    createdAt: Time;
    targetBranch: string;
    bodyHindi: string;
}
export interface LeaveBalance {
    emergency: bigint;
    sick: bigint;
    earned: bigint;
    casual: bigint;
}
export interface UserProfile {
    id: Principal;
    branch: string;
    nameHindi: string;
    name: string;
    role: Role;
    isActive: boolean;
    employeeId: string;
    phone: string;
    department: string;
    points: bigint;
}
export interface DigitalIdCard {
    rejectedReason?: string;
    approvedAt: Time;
    isActive: boolean;
    employeeId: Principal;
    validUntil: Time;
}
export enum AttendanceStatus {
    onLeave = "onLeave",
    present = "present",
    late = "late",
    absent = "absent"
}
export enum Role {
    supervisor = "supervisor",
    employee = "employee",
    management = "management"
}
export enum TaskPriority {
    routine = "routine",
    urgent = "urgent"
}
export enum TaskStatus {
    pending = "pending",
    blocked = "blocked",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    addBranch(name: string): Promise<bigint>;
    approveDigitalIdRequest(employeeId: Principal, approved: boolean, reason: string | null): Promise<void>;
    approveRegistrationRequest(requester: Principal): Promise<UserProfile | null>;
    approveTask(taskId: bigint, approved: boolean, reason: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkIn(): Promise<void>;
    checkOut(): Promise<void>;
    /**
     * / Claims the first run admin slot.
     */
    claimFirstRunAdmin(name: string, nameHindi: string, employeeId: string, phone: string, branch: string): Promise<UserProfile>;
    createAnnouncement(title: string, titleHindi: string, body: string, bodyHindi: string, targetBranch: string): Promise<bigint>;
    createFileCategory(name: string, allowedRoles: Array<Role>): Promise<bigint>;
    createTask(title: string, titleHindi: string, description: string, descriptionHindi: string, assignedTo: Principal, dueDate: Time, priority: TaskPriority, branch: string): Promise<bigint>;
    createUserProfile(profile: UserProfile): Promise<void>;
    deactivateUser(userId: Principal): Promise<void>;
    deleteBranch(id: bigint): Promise<void>;
    deleteFile(fileId: bigint): Promise<void>;
    deleteFileCategory(id: bigint): Promise<void>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllDigitalIds(): Promise<Array<DigitalIdCard>>;
    getAllFiles(): Promise<Array<FileRecord>>;
    getAssignedTasks(): Promise<Array<Task>>;
    getAttendanceHistory(userId: Principal): Promise<Array<AttendanceRecord>>;
    getBranchAttendance(branch: string): Promise<Array<AttendanceRecord>>;
    getBranches(): Promise<Array<Branch>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFileCategories(): Promise<Array<FileCategory>>;
    getFilesForCategory(categoryId: bigint): Promise<Array<FileRecord>>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getLeaveBalance(): Promise<LeaveBalance>;
    /**
     * / Gets the leave balance for a given principal.
     */
    getLeaveBalanceForPrincipal(employeeId: Principal): Promise<LeaveBalance>;
    getMyDigitalId(): Promise<DigitalIdCard | null>;
    getMyRegistrationStatus(): Promise<RegistrationRequest | null>;
    /**
     * / Gets the next available announcement ID.
     */
    getNextAnnouncementId(): Promise<bigint>;
    /**
     * / Gets the next available task ID.
     */
    getNextTaskId(): Promise<bigint>;
    getOwnPointsAndRank(): Promise<{
        rank: bigint;
        points: bigint;
    }>;
    getPendingDigitalIdRequests(): Promise<Array<Principal>>;
    getPendingRegistrationRequests(): Promise<Array<RegistrationRequest>>;
    /**
     * / Gets the points reward for a given task priority.
     */
    getPointsRewardForTask(priority: TaskPriority): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Checks if this is the first run of the application (no users registered yet).
     */
    isFirstRun(): Promise<boolean>;
    markAnnouncementAsRead(announcementId: bigint): Promise<void>;
    rejectRegistrationRequest(requester: Principal, reason: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitDigitalIdRequest(): Promise<void>;
    submitRegistrationRequest(name: string, nameHindi: string, role: Role, department: string, branch: string, phone: string, employeeId: string): Promise<void>;
    updateBranch(id: bigint, name: string): Promise<void>;
    updateFileCategory(id: bigint, name: string, allowedRoles: Array<Role>): Promise<void>;
    updateLeaveBalance(employeeId: Principal, sick: bigint, casual: bigint, earned: bigint, emergency: bigint): Promise<void>;
    updatePoints(userId: Principal, points: bigint): Promise<void>;
    updateTaskStatus(taskId: bigint, status: TaskStatus, completionNote: string | null): Promise<void>;
    updateUserProfile(userId: Principal, profile: UserProfile): Promise<void>;
    uploadFile(categoryId: bigint, fileName: string, fileType: string, fileData: Uint8Array): Promise<bigint>;
}
