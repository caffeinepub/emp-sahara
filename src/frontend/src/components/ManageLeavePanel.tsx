import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Loader2,
  Pencil,
  Search,
  Users,
  MapPin,
} from "lucide-react";
import { useLang } from "../contexts/LanguageContext";
import { ErrorState } from "./LoadingState";
import {
  useLeaderboard,
  useUpdateLeaveBalance,
  useGetBranches,
  useGetLeaveBalanceForPrincipal,
} from "../hooks/useQueries";
import type { LeaderboardEntry } from "../hooks/useQueries";
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";

// ---------- Employee leave edit dialog ----------

interface EditLeaveDialogProps {
  employee: LeaderboardEntry;
  open: boolean;
  onClose: () => void;
}

function EditLeaveDialog({ employee, open, onClose }: EditLeaveDialogProps) {
  const { lang, bi, tx } = useLang();
  const principalStr = employee.principal.toString();
  const displayName = lang === "en" ? employee.name : employee.nameHindi;

  const {
    data: balance,
    isLoading: balanceLoading,
    isError: balanceError,
    refetch,
  } = useGetLeaveBalanceForPrincipal(open ? principalStr : undefined);

  const { mutate: updateLeave, isPending: isSaving } = useUpdateLeaveBalance();

  const [sick, setSick] = useState("");
  const [casual, setCasual] = useState("");
  const [earned, setEarned] = useState("");
  const [emergency, setEmergency] = useState("");
  const [note, setNote] = useState("");

  // Sync form values when balance loads
  React.useEffect(() => {
    if (balance) {
      setSick(String(Number(balance.sick)));
      setCasual(String(Number(balance.casual)));
      setEarned(String(Number(balance.earned)));
      setEmergency(String(Number(balance.emergency)));
    }
  }, [balance]);

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setSick("");
      setCasual("");
      setEarned("");
      setEmergency("");
      setNote("");
    }
  }, [open]);

  const handleSave = () => {
    let p: Principal;
    try {
      p = Principal.fromText(principalStr);
    } catch {
      toast.error("Invalid principal");
      return;
    }

    const sickN = parseInt(sick, 10);
    const casualN = parseInt(casual, 10);
    const earnedN = parseInt(earned, 10);
    const emergencyN = parseInt(emergency, 10);

    if ([sickN, casualN, earnedN, emergencyN].some((v) => isNaN(v) || v < 0)) {
      toast.error("Please enter valid non-negative numbers for all leave types");
      return;
    }

    updateLeave(
      {
        employeeId: p,
        sick: BigInt(sickN),
        casual: BigInt(casualN),
        earned: BigInt(earnedN),
        emergency: BigInt(emergencyN),
      },
      {
        onSuccess: () => {
          toast.success(bi("leaveUpdated").primary);
          onClose();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  const fields = [
    { key: "sick" as const, label: bi("sick").primary, subLabel: bi("sick").secondary, val: sick, set: setSick, color: "text-blue-600" },
    { key: "casual" as const, label: bi("casual").primary, subLabel: bi("casual").secondary, val: casual, set: setCasual, color: "text-green-600" },
    { key: "earned" as const, label: bi("earned").primary, subLabel: bi("earned").secondary, val: earned, set: setEarned, color: "text-amber-600" },
    { key: "emergency" as const, label: bi("emergency").primary, subLabel: bi("emergency").secondary, val: emergency, set: setEmergency, color: "text-red-600" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{bi("editLeaves").primary}</span>
            <span className="text-xs text-muted-foreground font-hindi ml-1">{bi("editLeaves").secondary}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Employee info */}
        <div className="rounded-xl bg-muted/40 border border-border px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">{employee.branch}</span>
            </div>
          </div>
        </div>

        {/* Current balance loading */}
        {balanceLoading && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {bi("currentBalance").primary}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {balanceError && (
          <ErrorState onRetry={() => refetch()} />
        )}

        {/* Leave inputs */}
        {!balanceLoading && !balanceError && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {bi("editLeaves").primary} ({bi("days").primary})
            </p>
            <div className="grid grid-cols-2 gap-3">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className={`text-xs font-semibold ${field.color}`}>
                    {field.label}
                    <span className="ml-1 text-[10px] text-muted-foreground font-hindi font-normal">
                      {field.subLabel}
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={field.val}
                    onChange={(e) => field.set(e.target.value)}
                    className="h-11 text-base font-bold text-center tap-target"
                    disabled={isSaving}
                  />
                </div>
              ))}
            </div>

            {/* Optional note */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {bi("leaveNote").primary}
                <span className="ml-1 font-hindi text-[10px]">{bi("leaveNote").secondary}</span>
              </Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={bi("leaveNote").primary}
                className="min-h-[60px] text-sm resize-none"
                disabled={isSaving}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 h-11 tap-target"
          >
            {tx("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || balanceLoading || balanceError}
            className="flex-1 h-11 wine-gradient text-white tap-target"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tx("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Employee row ----------

interface EmployeeRowProps {
  employee: LeaderboardEntry;
  onEdit: (employee: LeaderboardEntry) => void;
}

function EmployeeRow({ employee, onEdit }: EmployeeRowProps) {
  const { lang, bi } = useLang();
  const displayName = lang === "en" ? employee.name : employee.nameHindi;
  const secondaryName = lang === "en" ? employee.nameHindi : employee.name;

  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 animate-fade-in">
      {/* Avatar initial */}
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-sm font-display font-bold text-primary">
        {(displayName[0] ?? "?").toUpperCase()}
      </div>

      {/* Name + branch */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground font-hindi truncate">{secondaryName}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground truncate">{employee.branch}</span>
        </div>
      </div>

      {/* Edit button */}
      <Button
        size="sm"
        variant="outline"
        className="h-10 px-3 shrink-0 tap-target gap-1.5"
        onClick={() => onEdit(employee)}
        title={bi("editLeaves").primary}
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="text-xs hidden sm:inline">{bi("editLeaves").primary}</span>
      </Button>
    </div>
  );
}

// ---------- Main ManageLeavePanel ----------

export default function ManageLeavePanel() {
  const { lang, bi } = useLang();
  const { data: employees, isLoading, isError, refetch } = useLeaderboard();
  const { data: branches } = useGetBranches();

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [editingEmployee, setEditingEmployee] = useState<LeaderboardEntry | null>(null);

  const filtered = useMemo(() => {
    if (!employees) return [];
    return employees.filter((emp) => {
      const matchBranch = branchFilter === "all" || emp.branch === branchFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.nameHindi.includes(q) ||
        emp.branch.toLowerCase().includes(q);
      return matchBranch && matchSearch;
    });
  }, [employees, search, branchFilter]);

  return (
    <Card className="overflow-hidden animate-fade-in">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>{bi("manageLeaves").primary}</span>
          <span className="text-xs text-muted-foreground font-hindi ml-1">{bi("manageLeaves").secondary}</span>
          {employees && employees.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {employees.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        {/* Filters */}
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${bi("searchEmployees").primary} / ${bi("searchEmployees").secondary}`}
              className="h-10 pl-8 text-sm tap-target"
            />
          </div>

          {/* Branch filter */}
          {branches && branches.length > 0 && (
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-10 w-36 shrink-0 text-sm">
                <SelectValue placeholder={bi("filterBranch").primary} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {lang === "en" ? "All Branches" : "सभी शाखाएं"}
                </SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id.toString()} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Employee list */}
        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[68px] rounded-xl" />
            ))}
          </div>
        )}

        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
            <Users className="h-10 w-10 opacity-30" />
            <p className="text-sm">{bi("noEmployees").primary}</p>
            <p className="text-xs font-hindi opacity-70">{bi("noEmployees").secondary}</p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((emp) => (
              <EmployeeRow
                key={emp.principal.toString()}
                employee={emp}
                onEdit={setEditingEmployee}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit dialog */}
      {editingEmployee && (
        <EditLeaveDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onClose={() => setEditingEmployee(null)}
        />
      )}
    </Card>
  );
}
