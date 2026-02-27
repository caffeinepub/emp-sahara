import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import {
  type UserProfile,
  type Task,
  type AttendanceRecord,
  type Announcement,
  type LeaveBalance,
  type LeaderboardEntry,
  type Branch,
  type DigitalIdCard,
  type RegistrationRequest,
  type FileCategory,
  type FileRecord,
  TaskStatus,
  TaskPriority,
  Role,
  Variant_pending_approved_rejected,
} from "../backend.d";
import type { Principal } from "@icp-sdk/core/principal";

// ---- Profile ---------------------------------------------------------------

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetUserProfile(principal?: string) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal: IcpPrincipal } = await import("@icp-sdk/core/principal");
      return actor.getUserProfile(IcpPrincipal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useDeactivateUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deactivateUser(userId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allProfiles"] });
    },
  });
}

// ---- Attendance ------------------------------------------------------------

export function useCheckIn() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.checkIn();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["attendanceHistory"] });
    },
  });
}

export function useCheckOut() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.checkOut();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["attendanceHistory"] });
    },
  });
}

export function useAttendanceHistory(userId?: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendanceHistory", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getAttendanceHistory(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// ---- Tasks -----------------------------------------------------------------

export function useAssignedTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["assignedTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssignedTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      completionNote,
    }: {
      taskId: bigint;
      status: TaskStatus;
      completionNote: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateTaskStatus(taskId, status, completionNote);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["assignedTasks"] });
    },
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      titleHindi: string;
      description: string;
      descriptionHindi: string;
      assignedTo: Principal;
      dueDate: bigint;
      priority: TaskPriority;
      branch: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createTask(
        args.title,
        args.titleHindi,
        args.description,
        args.descriptionHindi,
        args.assignedTo,
        args.dueDate,
        args.priority,
        args.branch,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["assignedTasks"] });
    },
  });
}

export function useApproveTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      approved,
      reason,
    }: {
      taskId: bigint;
      approved: boolean;
      reason: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.approveTask(taskId, approved, reason);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["assignedTasks"] });
    },
  });
}

// ---- Rewards ---------------------------------------------------------------

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOwnPointsAndRank() {
  const { actor, isFetching } = useActor();
  return useQuery<{ rank: bigint; points: bigint }>({
    queryKey: ["ownPointsAndRank"],
    queryFn: async () => {
      if (!actor) return { rank: BigInt(0), points: BigInt(0) };
      return actor.getOwnPointsAndRank();
    },
    enabled: !!actor && !isFetching,
  });
}

// ---- Announcements ---------------------------------------------------------

export function useAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkAnnouncementRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.markAnnouncementAsRead(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      title: string;
      titleHindi: string;
      body: string;
      bodyHindi: string;
      targetBranch: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createAnnouncement(
        args.title,
        args.titleHindi,
        args.body,
        args.bodyHindi,
        args.targetBranch,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

// ---- Leave -----------------------------------------------------------------

export function useLeaveBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaveBalance>({
    queryKey: ["leaveBalance"],
    queryFn: async () => {
      if (!actor) return { sick: BigInt(0), casual: BigInt(0), earned: BigInt(0), emergency: BigInt(0) };
      return actor.getLeaveBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateLeaveBalance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      employeeId: Principal;
      sick: bigint;
      casual: bigint;
      earned: bigint;
      emergency: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateLeaveBalance(
        args.employeeId,
        args.sick,
        args.casual,
        args.earned,
        args.emergency,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leaveBalance"] });
    },
  });
}

// ---- Branches --------------------------------------------------------------

export function useGetBranches() {
  const { actor, isFetching } = useActor();
  return useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBranches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBranch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addBranch(name);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useUpdateBranch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: bigint; name: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBranch(id, name);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useDeleteBranch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteBranch(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

// ---- Digital ID ------------------------------------------------------------

export function useGetMyDigitalId() {
  const { actor, isFetching } = useActor();
  return useQuery<DigitalIdCard | null>({
    queryKey: ["myDigitalId"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyDigitalId();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitDigitalIdRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await actor.submitDigitalIdRequest();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["myDigitalId"] });
    },
  });
}

export function useGetPendingDigitalIdRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<Principal[]>({
    queryKey: ["pendingDigitalIdRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingDigitalIdRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllDigitalIds() {
  const { actor, isFetching } = useActor();
  return useQuery<DigitalIdCard[]>({
    queryKey: ["allDigitalIds"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDigitalIds();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveDigitalIdRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      approved,
      reason,
    }: {
      employeeId: Principal;
      approved: boolean;
      reason: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.approveDigitalIdRequest(employeeId, approved, reason);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pendingDigitalIdRequests"] });
      void qc.invalidateQueries({ queryKey: ["allDigitalIds"] });
    },
  });
}

// ---- Registration ----------------------------------------------------------

export function useSubmitRegistrationRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      name: string;
      nameHindi: string;
      role: Role;
      department: string;
      branch: string;
      phone: string;
      employeeId: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.submitRegistrationRequest(
        args.name,
        args.nameHindi,
        args.role,
        args.department,
        args.branch,
        args.phone,
        args.employeeId,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["myRegistrationStatus"] });
    },
  });
}

export function useGetMyRegistrationStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<RegistrationRequest | null>({
    queryKey: ["myRegistrationStatus"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyRegistrationStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingRegistrationRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<RegistrationRequest[]>({
    queryKey: ["pendingRegistrationRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingRegistrationRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveRegistrationRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requester: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveRegistrationRequest(requester);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pendingRegistrationRequests"] });
    },
  });
}

export function useRejectRegistrationRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requester, reason }: { requester: Principal; reason: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.rejectRegistrationRequest(requester, reason);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pendingRegistrationRequests"] });
    },
  });
}

// ---- Files -----------------------------------------------------------------

export function useGetFileCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<FileCategory[]>({
    queryKey: ["fileCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFileCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateFileCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, allowedRoles }: { name: string; allowedRoles: Array<Role> }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createFileCategory(name, allowedRoles);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["fileCategories"] });
    },
  });
}

export function useUpdateFileCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, allowedRoles }: { id: bigint; name: string; allowedRoles: Array<Role> }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateFileCategory(id, name, allowedRoles);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["fileCategories"] });
    },
  });
}

export function useDeleteFileCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteFileCategory(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["fileCategories"] });
      void qc.invalidateQueries({ queryKey: ["filesForCategory"] });
    },
  });
}

export function useGetFilesForCategory(categoryId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<FileRecord[]>({
    queryKey: ["filesForCategory", categoryId?.toString()],
    queryFn: async () => {
      if (!actor || categoryId === null) return [];
      return actor.getFilesForCategory(categoryId);
    },
    enabled: !!actor && !isFetching && categoryId !== null,
  });
}

export function useGetAllFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<FileRecord[]>({
    queryKey: ["allFileRecords"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadFile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      categoryId,
      fileName,
      fileType,
      fileData,
    }: {
      categoryId: bigint;
      fileName: string;
      fileType: string;
      fileData: Uint8Array;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadFile(categoryId, fileName, fileType, fileData);
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ["filesForCategory", vars.categoryId.toString()] });
      void qc.invalidateQueries({ queryKey: ["allFileRecords"] });
    },
  });
}

export function useDeleteFile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteFile(fileId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["filesForCategory"] });
      void qc.invalidateQueries({ queryKey: ["allFileRecords"] });
    },
  });
}

// ---- First Run -------------------------------------------------------------

export function useIsFirstRun() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isFirstRun"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isFirstRun();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useClaimFirstRunAdmin() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { name: string; nameHindi: string; employeeId: string; phone: string; branch: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.claimFirstRunAdmin(args.name, args.nameHindi, args.employeeId, args.phone, args.branch);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
      void qc.invalidateQueries({ queryKey: ["isFirstRun"] });
    },
  });
}

// Re-export types for convenience
export type { UserProfile, Task, AttendanceRecord, Announcement, LeaveBalance, LeaderboardEntry, Branch, DigitalIdCard, RegistrationRequest, FileCategory, FileRecord };
export { TaskStatus, TaskPriority, Role, Variant_pending_approved_rejected };
