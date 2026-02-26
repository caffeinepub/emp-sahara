import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare, Plus, ChevronDown, ChevronUp, Loader2,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorState, EmptyState } from "../components/LoadingState";
import {
  useAssignedTasks,
  useUpdateTaskStatus,
  useCreateTask,
  useApproveTask,
  TaskStatus,
  TaskPriority,
  Role,
} from "../hooks/useQueries";
import type { UserProfile, Task } from "../backend.d";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Principal } from "@dfinity/principal";

interface TasksPageProps {
  profile: UserProfile;
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN");
}

// ---------- Employee Task Card ----------

function EmployeeTaskCard({ task, lang }: { task: Task; lang: "en" | "hi" }) {
  const [expanded, setExpanded] = useState(false);
  const [newStatus, setNewStatus] = useState<TaskStatus>(task.status);
  const [note, setNote] = useState(task.completionNote ?? "");
  const { mutate: updateStatus, isPending } = useUpdateTaskStatus();
  const { bi, tx } = useLang();

  const title = lang === "en" ? task.title : task.titleHindi;
  const desc  = lang === "en" ? task.description : task.descriptionHindi;

  const handleUpdate = () => {
    updateStatus(
      {
        taskId: task.id,
        status: newStatus,
        completionNote: newStatus === TaskStatus.completed ? note || null : null,
      },
      {
        onSuccess: () => {
          toast.success(tx("completed"));
          setExpanded(false);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card overflow-hidden transition-all animate-fade-in",
        task.priority === TaskPriority.urgent ? "border-red-200" : "border-border",
      )}
    >
      <button
        type="button"
        className="w-full text-left p-4 tap-target"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={task.priority as "routine" | "urgent"} />
              <StatusBadge status={task.status as "pending" | "inProgress" | "completed" | "blocked"} />
            </div>
            <p className="text-sm font-semibold text-foreground mt-2 leading-tight">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-hindi line-clamp-2">{desc}</p>
            <p className="text-xs text-muted-foreground mt-1">Due: {formatDate(task.dueDate)}</p>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {bi("updateStatus").primary} · {bi("updateStatus").secondary}
            </Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {bi(s as "pending" | "inProgress" | "completed" | "blocked").primary}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newStatus === TaskStatus.completed && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {bi("completionNote").primary} · {bi("completionNote").secondary}
              </Label>
              <Textarea
                rows={3}
                placeholder="Add completion note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          <Button
            onClick={handleUpdate}
            disabled={isPending}
            size="sm"
            className="w-full h-10 wine-gradient text-white tap-target"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {bi("updateStatus").primary}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------- Supervisor Task Card ----------

function SupervisorTaskCard({ task, lang }: { task: Task; lang: "en" | "hi" }) {
  const [rejReason, setRejReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const { mutate: approveTask, isPending } = useApproveTask();
  const { bi, tx } = useLang();

  const title = lang === "en" ? task.title : task.titleHindi;

  const handleApprove = () =>
    approveTask({ taskId: task.id, approved: true, reason: null }, {
      onSuccess: () => toast.success(tx("approve")),
      onError: (e) => toast.error(e.message),
    });

  const handleReject = () =>
    approveTask({ taskId: task.id, approved: false, reason: rejReason || null }, {
      onSuccess: () => { toast.success(tx("reject")); setShowReject(false); },
      onError: (e) => toast.error(e.message),
    });

  const isCompleted = task.status === TaskStatus.completed;
  const needsApproval = isCompleted && task.approved === undefined;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-2 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            <StatusBadge status={task.priority as "routine" | "urgent"} />
            <StatusBadge status={task.status as "pending" | "inProgress" | "completed" | "blocked"} />
          </div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">Due: {formatDate(task.dueDate)} · {task.branch}</p>
          {task.completionNote && (
            <p className="text-xs text-muted-foreground mt-1 italic">"{task.completionNote}"</p>
          )}
        </div>
      </div>

      {needsApproval && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1 h-9 bg-green-600 hover:bg-green-700 text-white tap-target text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            {bi("approve").primary}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowReject((v) => !v)}
            className="flex-1 h-9 border-red-200 text-red-600 tap-target text-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            {bi("reject").primary}
          </Button>
        </div>
      )}

      {showReject && (
        <div className="space-y-2 pt-1">
          <Textarea
            rows={2}
            placeholder="Rejection reason…"
            value={rejReason}
            onChange={(e) => setRejReason(e.target.value)}
            className="text-xs"
          />
          <Button
            size="sm"
            onClick={handleReject}
            disabled={isPending}
            className="w-full h-9 bg-red-600 hover:bg-red-700 text-white tap-target text-xs"
          >
            {bi("confirm").primary} {bi("reject").primary}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------- Create Task Form ----------

function CreateTaskForm({ profile }: { profile: UserProfile }) {
  const { bi, tx } = useLang();
  const { mutate: createTask, isPending } = useCreateTask();
  const [form, setForm] = useState({
    title: "",
    titleHindi: "",
    description: "",
    descriptionHindi: "",
    assignedTo: "",
    dueDate: "",
    priority: TaskPriority.routine as TaskPriority,
    branch: profile.branch,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let assignedPrincipal: Principal;
    try {
      assignedPrincipal = Principal.fromText(form.assignedTo);
    } catch {
      toast.error("Invalid principal ID");
      return;
    }

    const dueMs = new Date(form.dueDate).getTime();
    createTask(
      {
        title: form.title,
        titleHindi: form.titleHindi,
        description: form.description,
        descriptionHindi: form.descriptionHindi,
        assignedTo: assignedPrincipal,
        dueDate: BigInt(dueMs * 1_000_000),
        priority: form.priority,
        branch: form.branch,
      },
      {
        onSuccess: () => {
          toast.success(tx("taskCreated"));
          setForm({
            title: "", titleHindi: "", description: "", descriptionHindi: "",
            assignedTo: "", dueDate: "", priority: TaskPriority.routine, branch: profile.branch,
          });
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const f = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{bi("titleEn").primary}</Label>
          <Input placeholder="Task title" {...f("title")} className="h-10 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-hindi">{bi("titleHi").secondary}</Label>
          <Input placeholder="काम का नाम" {...f("titleHindi")} className="h-10 text-sm font-hindi" />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{bi("descEn").primary}</Label>
        <Textarea rows={2} placeholder="Description" {...f("description")} className="text-sm" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-hindi">{bi("descHi").secondary}</Label>
        <Textarea rows={2} placeholder="विवरण" {...f("descriptionHindi")} className="text-sm font-hindi" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{bi("assignedTo").primary}</Label>
        <Input placeholder="Principal ID" {...f("assignedTo")} className="h-10 text-sm font-mono" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">{bi("dueDate").primary}</Label>
          <Input type="date" {...f("dueDate")} className="h-10 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{bi("priority").primary}</Label>
          <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v as TaskPriority }))}>
            <SelectTrigger className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TaskPriority.routine}>{bi("routine").primary}</SelectItem>
              <SelectItem value={TaskPriority.urgent}>{bi("urgent").primary}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{bi("branch").primary}</Label>
        <Input placeholder="Branch" {...f("branch")} className="h-10 text-sm" />
      </div>

      <Button
        type="submit"
        disabled={isPending || !form.title || !form.assignedTo || !form.dueDate}
        className="w-full h-12 wine-gradient text-white font-semibold rounded-xl tap-target"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
        {bi("createTask").primary} · {bi("createTask").secondary}
      </Button>
    </form>
  );
}

// ---------- Main Component ----------

export default function TasksPage({ profile }: TasksPageProps) {
  const { lang, bi, tx } = useLang();
  const tasks = useAssignedTasks();
  const isStaff = profile.role === Role.employee;

  return (
    <main className="pb-nav px-4 pt-4 space-y-4">
      <div className="flex items-center gap-2 animate-slide-up">
        <CheckSquare className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">
            {bi("tasks").primary}
          </h2>
          <p className="text-xs text-muted-foreground font-hindi">{bi("tasks").secondary}</p>
        </div>
      </div>

      {isStaff ? (
        // Employee: just task list
        <div className="space-y-3">
          {tasks.isLoading && (
            <div className="space-y-3">
              {["a","b","c"].map((k) => <Skeleton key={k} className="h-28 rounded-xl" />)}
            </div>
          )}
          {tasks.isError && <ErrorState onRetry={() => tasks.refetch()} />}
          {!tasks.isLoading && !tasks.isError && (
            tasks.data && tasks.data.length > 0 ? (
              <div className="space-y-3">
                {tasks.data.map((task) => (
                  <EmployeeTaskCard key={task.id.toString()} task={task} lang={lang} />
                ))}
              </div>
            ) : (
              <EmptyState icon="✅" message={tx("noTasks")} />
            )
          )}
        </div>
      ) : (
        // Supervisor/management: tabs
        <Tabs defaultValue="team">
          <TabsList className="w-full grid grid-cols-2 rounded-xl bg-muted">
            <TabsTrigger value="team" className="rounded-lg text-xs">
              {bi("teamTasks").primary}
              <span className="ml-1 text-[10px] opacity-60 font-hindi">{bi("teamTasks").secondary}</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="rounded-lg text-xs">
              {bi("createTask").primary}
              <span className="ml-1 text-[10px] opacity-60 font-hindi">{bi("createTask").secondary}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="mt-4 space-y-3">
            {tasks.isLoading && (
              <div className="space-y-3">
                {["a","b","c"].map((k) => <Skeleton key={k} className="h-28 rounded-xl" />)}
              </div>
            )}
            {tasks.isError && <ErrorState onRetry={() => tasks.refetch()} />}
            {!tasks.isLoading && !tasks.isError && (
              tasks.data && tasks.data.length > 0 ? (
                <div className="space-y-3">
                  {tasks.data.map((task) => (
                    <SupervisorTaskCard key={task.id.toString()} task={task} lang={lang} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="✅" message={tx("noTasks")} />
              )
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <CreateTaskForm profile={profile} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
