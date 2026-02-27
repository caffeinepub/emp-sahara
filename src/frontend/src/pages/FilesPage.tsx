import React, { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { ErrorState } from "../components/LoadingState";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Role } from "../backend.d";
import type { UserProfile, FileCategory, FileRecord } from "../backend.d";
import type { Principal } from "@icp-sdk/core/principal";
import {
  useGetFileCategories,
  useCreateFileCategory,
  useUpdateFileCategory,
  useDeleteFileCategory,
  useGetFilesForCategory,
  useUploadFile,
  useDeleteFile,
} from "../hooks/useQueries";


interface FilesPageProps {
  profile: UserProfile;
  principal: Principal;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadFile(file: FileRecord) {
  const blob = new Blob([file.fileData.buffer as ArrayBuffer], { type: file.fileType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function FileTypeIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className={cn("text-emerald-500", className)} />;
  }
  if (mimeType === "application/pdf") {
    return <FileText className={cn("text-red-500", className)} />;
  }
  return <File className={cn("text-blue-500", className)} />;
}

function roleBadgeLabel(role: Role, lang: "en" | "hi"): string {
  const labels: Record<Role, { en: string; hi: string }> = {
    [Role.employee]: { en: "Employee", hi: "कर्मचारी" },
    [Role.supervisor]: { en: "Supervisor", hi: "पर्यवेक्षक" },
    [Role.management]: { en: "Management", hi: "प्रबंधन" },
  };
  return labels[role]?.[lang] ?? role;
}

// ── Category Form (create/edit) ───────────────────────────────────────────────

interface CategoryFormProps {
  initial?: { name: string; allowedRoles: Role[] };
  onSave: (name: string, allowedRoles: Role[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function CategoryForm({ initial, onSave, onCancel, isSaving }: CategoryFormProps) {
  const { bi, tx, lang } = useLang();
  const [name, setName] = useState(initial?.name ?? "");
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(
    new Set(initial?.allowedRoles ?? [Role.employee, Role.supervisor, Role.management]),
  );

  const allRoles: Role[] = [Role.employee, Role.supervisor, Role.management];

  const toggleRole = (role: Role) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, Array.from(selectedRoles));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs font-medium">
          {bi("categoryName").primary}
          <span className="ml-1 text-muted-foreground font-hindi text-[10px]">
            {bi("categoryName").secondary}
          </span>
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${bi("categoryName").primary}…`}
          className="h-11 tap-target"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-medium leading-none">
          {bi("allowedRoles").primary}
          <span className="ml-1 text-muted-foreground font-hindi text-[10px]">
            {bi("allowedRoles").secondary}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {allRoles.map((role) => (
            <label
              key={role}
              htmlFor={`role-checkbox-${role}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors tap-target",
                selectedRoles.has(role)
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/40 border-border text-muted-foreground",
              )}
            >
              <Checkbox
                id={`role-checkbox-${role}`}
                checked={selectedRoles.has(role)}
                onCheckedChange={() => toggleRole(role)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs font-medium">{roleBadgeLabel(role, lang)}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          className="flex-1 h-11 wine-gradient text-white tap-target"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
          {tx("save")}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="h-11 px-4 tap-target"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── File upload trigger ───────────────────────────────────────────────────────

interface FileUploadButtonProps {
  categoryId: bigint;
  categoryName: string;
  onUploaded: () => void;
}

function FileUploadButton({ categoryId, categoryName, onUploaded }: FileUploadButtonProps) {
  const { bi } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadFile, isPending } = useUploadFile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const fileData = new Uint8Array(buffer);
      uploadFile(
        { categoryId, fileName: file.name, fileType: file.type || "application/octet-stream", fileData },
        {
          onSuccess: () => {
            toast.success(bi("fileUploaded").primary);
            onUploaded();
          },
          onError: (err) => toast.error(err.message),
        },
      );
    } catch (err) {
      toast.error("Failed to read file");
    }
    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        size="sm"
        variant="outline"
        className="h-9 tap-target text-xs"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        title={`${bi("uploadFile").primary} → ${categoryName}`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
        ) : (
          <Upload className="h-3.5 w-3.5 mr-1" />
        )}
        {isPending ? bi("uploading").primary : bi("uploadFile").primary}
      </Button>
    </>
  );
}

// ── File row ─────────────────────────────────────────────────────────────────

interface FileRowProps {
  file: FileRecord;
  canDelete: boolean;
  onDeleted: () => void;
}

function FileRow({ file, canDelete, onDeleted }: FileRowProps) {
  const { bi } = useLang();
  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFile();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    deleteFile(file.id, {
      onSuccess: () => {
        toast.success(bi("fileDeleted").primary);
        onDeleted();
        setConfirmDelete(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const uploadedDate = new Date(Number(file.uploadedAt) / 1_000_000);
  const dateStr = uploadedDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background border border-border/60 group">
      {/* Icon */}
      <div className="shrink-0">
        <FileTypeIcon mimeType={file.fileType} className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-tight">{file.fileName}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatFileSize(file.fileData.length)} · {dateStr}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {confirmDelete ? (
          <>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 tap-target"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 tap-target text-primary hover:bg-primary/10"
              onClick={() => downloadFile(file)}
              title={bi("downloadFile").primary}
            >
              <Download className="h-4 w-4" />
            </Button>
            {canDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 tap-target text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}
                title={bi("deleteFile").primary}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Category section (collapsible) ───────────────────────────────────────────

interface CategorySectionProps {
  category: FileCategory;
  userRole: Role;
  userPrincipal: Principal;
  canManageCategories: boolean;
  canUpload: boolean;
  onCategoryDeleted: () => void;
}

function CategorySection({
  category,
  userRole,
  userPrincipal,
  canManageCategories,
  canUpload,
  onCategoryDeleted,
}: CategorySectionProps) {
  const { bi, tx, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: files, isLoading: filesLoading, refetch: refetchFiles } = useGetFilesForCategory(
    open ? category.id : null,
  );
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateFileCategory();
  const { mutate: deleteCategory, isPending: isDeletingCat } = useDeleteFileCategory();

  const isAccessible = category.allowedRoles.includes(userRole);

  const handleUpdate = (name: string, allowedRoles: Role[]) => {
    updateCategory(
      { id: category.id, name, allowedRoles },
      {
        onSuccess: () => {
          toast.success(bi("categoryCreated").primary);
          setIsEditing(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleDeleteCategory = () => {
    deleteCategory(category.id, {
      onSuccess: () => {
        toast.success(bi("categoryDeleted").primary);
        onCategoryDeleted();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const canDeleteFile = (file: FileRecord): boolean => {
    if (canManageCategories) return true;
    if (canUpload && file.uploadedBy.toString() === userPrincipal.toString()) return true;
    return false;
  };

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden transition-all",
      isAccessible ? "border-border bg-card" : "border-border/40 bg-muted/20",
    )}>
      {/* Header */}
      {isEditing ? (
        <div className="p-4">
          <CategoryForm
            initial={{ name: category.name, allowedRoles: Array.from(category.allowedRoles) }}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isSaving={isUpdating}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            className="flex items-center gap-3 flex-1 min-w-0 tap-target"
            onClick={() => setOpen((p) => !p)}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              isAccessible ? "bg-primary/10" : "bg-muted",
            )}>
              {isAccessible ? (
                <Unlock className="h-4 w-4 text-primary" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold leading-tight truncate">{category.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {category.allowedRoles.map((r) => (
                  <span
                    key={r}
                    className={cn(
                      "inline-block px-1.5 py-0.5 rounded text-[9px] font-medium",
                      r === Role.employee && "bg-blue-100 text-blue-700",
                      r === Role.supervisor && "bg-amber-100 text-amber-700",
                      r === Role.management && "bg-purple-100 text-purple-700",
                    )}
                  >
                    {roleBadgeLabel(r, lang)}
                  </span>
                ))}
              </div>
            </div>
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
          </button>

          {/* Management action buttons */}
          {canManageCategories && (
            <div className="flex items-center gap-1 shrink-0">
              {confirmDelete ? (
                <>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={handleDeleteCategory}
                    disabled={isDeletingCat}
                  >
                    {isDeletingCat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeletingCat}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => { setIsEditing(true); setConfirmDelete(false); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => { setConfirmDelete(true); setIsEditing(false); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Upload button for supervisor/management */}
          {canUpload && isAccessible && !canManageCategories && (
            <div className="shrink-0">
              <FileUploadButton
                categoryId={category.id}
                categoryName={category.name}
                onUploaded={() => { void refetchFiles(); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Upload button for management — always visible in open state */}
      {open && canUpload && !isEditing && (
        <div className="px-4 pb-2 flex justify-end">
          <FileUploadButton
            categoryId={category.id}
            categoryName={category.name}
            onUploaded={() => { void refetchFiles(); }}
          />
        </div>
      )}

      {/* Files list */}
      {open && !isEditing && (
        <div className="px-4 pb-4 space-y-2">
          {filesLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          )}
          {!filesLoading && (!files || files.length === 0) && (
            <div className="flex flex-col items-center py-5 gap-2 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground opacity-30" />
              <p className="text-xs text-muted-foreground">{bi("noFiles").primary}</p>
              <p className="text-[10px] text-muted-foreground font-hindi opacity-70">{bi("noFiles").secondary}</p>
            </div>
          )}
          {!filesLoading && files && files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <FileRow
                  key={file.id.toString()}
                  file={file}
                  canDelete={canDeleteFile(file)}
                  onDeleted={() => { void refetchFiles(); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add Category Dialog ───────────────────────────────────────────────────────

function AddCategoryDialog({ onCreated }: { onCreated: () => void }) {
  const { bi } = useLang();
  const { mutate: createCategory, isPending } = useCreateFileCategory();
  const [open, setOpen] = useState(false);

  const handleCreate = (name: string, allowedRoles: Role[]) => {
    createCategory(
      { name, allowedRoles },
      {
        onSuccess: () => {
          toast.success(bi("categoryCreated").primary);
          onCreated();
          setOpen(false);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 wine-gradient text-white tap-target flex-1 sm:flex-none">
          <Plus className="h-4 w-4 mr-1.5" />
          {bi("addCategory").primary}
          <span className="ml-1.5 text-xs opacity-80 font-hindi">{bi("addCategory").secondary}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            {bi("addCategory").primary}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm
          onSave={handleCreate}
          onCancel={() => setOpen(false)}
          isSaving={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FilesPage({ profile, principal }: FilesPageProps) {
  const { bi, lang } = useLang();

  const { data: categories, isLoading, isError, refetch } = useGetFileCategories();

  const isManagement = profile.role === Role.management;
  const isSupervisor = profile.role === Role.supervisor;
  const canManageCategories = isManagement;
  const canUpload = isManagement || isSupervisor;

  // Filter categories to those accessible to the user
  const visibleCategories = categories?.filter((cat) => {
    if (isManagement) return true; // Management sees all
    return cat.allowedRoles.includes(profile.role as Role);
  }) ?? [];

  return (
    <main className="pb-nav px-4 pt-4 space-y-4 animate-fade-in">
      {/* Header banner */}
      <div className="rounded-2xl wine-gradient wine-texture px-5 py-4 shadow-wine">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-white leading-tight">
              {bi("filesSection").primary}
            </h1>
            <p className="text-white/70 text-xs font-hindi">
              {bi("filesSection").secondary}
            </p>
          </div>
        </div>
      </div>

      {/* Management toolbar */}
      {canManageCategories && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <FolderOpen className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-semibold">{bi("manageCategories").primary}</span>
            <span className="text-xs text-muted-foreground font-hindi">{bi("manageCategories").secondary}</span>
          </div>
          <AddCategoryDialog onCreated={() => void refetch()} />
        </div>
      )}

      {/* Supervisor upload hint */}
      {isSupervisor && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
          <Upload className="h-4 w-4 shrink-0" />
          <p className="text-xs">
            {lang === "en"
              ? "You can upload files to accessible categories below."
              : "आप नीचे उपलब्ध श्रेणियों में फाइलें अपलोड कर सकते हैं।"}
          </p>
        </div>
      )}

      {/* Categories list */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && visibleCategories.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground opacity-30" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{bi("noCategories").primary}</p>
            <p className="text-xs text-muted-foreground font-hindi mt-0.5">{bi("noCategories").secondary}</p>
          </div>
          {canManageCategories && (
            <AddCategoryDialog onCreated={() => void refetch()} />
          )}
        </div>
      )}

      {!isLoading && !isError && visibleCategories.length > 0 && (
        <div className="space-y-3">
          {visibleCategories.map((category) => (
            <CategorySection
              key={category.id.toString()}
              category={category}
              userRole={profile.role as Role}
              userPrincipal={principal}
              canManageCategories={canManageCategories}
              canUpload={canUpload}
              onCategoryDeleted={() => void refetch()}
            />
          ))}
        </div>
      )}

      {/* Legend for management */}
      {isManagement && categories && categories.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {lang === "en" ? "Access levels" : "पहुंच स्तर"}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { role: Role.employee, bg: "bg-blue-100 text-blue-700" },
              { role: Role.supervisor, bg: "bg-amber-100 text-amber-700" },
              { role: Role.management, bg: "bg-purple-100 text-purple-700" },
            ].map(({ role, bg }) => (
              <span key={role} className={cn("px-2 py-1 rounded text-[10px] font-medium", bg)}>
                {roleBadgeLabel(role, lang)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center pt-2 pb-4">
        <p className="text-xs text-muted-foreground">
          © 2026. Built with <span className="text-red-400">♥</span> using{" "}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline">
            caffeine.ai
          </a>
        </p>
      </footer>
    </main>
  );
}
