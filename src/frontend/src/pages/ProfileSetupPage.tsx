import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Grape, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLang } from "../contexts/LanguageContext";
import { useSaveCallerUserProfile, useGetBranches, Role } from "../hooks/useQueries";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";

const DEPARTMENTS = [
  "Production",
  "Cellar",
  "Tasting Room",
  "Sales",
  "Maintenance",
  "Quality Control",
  "Management",
  "Administration",
];

export default function ProfileSetupPage() {
  const { identity } = useInternetIdentity();
  const { tx, bi } = useLang();
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const { data: branches, isLoading: branchesLoading } = useGetBranches();

  const [form, setForm] = useState({
    name: "",
    nameHindi: "",
    role: "" as Role | "",
    department: "",
    branch: "",
    employeeId: "",
    phone: "",
  });

  const isValid = form.name && form.nameHindi && form.role && form.department && form.branch && form.employeeId && form.phone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !form.role) return;

    const profile: UserProfile = {
      id: identity.getPrincipal(),
      name: form.name,
      nameHindi: form.nameHindi,
      role: form.role as Role,
      department: form.department,
      branch: form.branch,
      employeeId: form.employeeId,
      phone: form.phone,
      isActive: true,
      points: BigInt(0),
    };

    saveProfile(profile, {
      onSuccess: () => toast.success(tx("saved")),
      onError: () => toast.error(tx("error")),
    });
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-16 h-16 rounded-full wine-gradient flex items-center justify-center shadow-wine">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {bi("profileSetup").primary}
            </h1>
            <p className="text-sm text-muted-foreground font-hindi mt-0.5">
              {bi("profileSetup").secondary}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bi("profileSetupSub").primary} · {bi("profileSetupSub").secondary}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              {bi("name").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("name").secondary}</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Ramesh Kumar"
              {...field("name")}
              className="h-12 tap-target"
            />
          </div>

          {/* Name Hindi */}
          <div className="space-y-1.5">
            <Label htmlFor="nameHindi" className="text-sm font-medium">
              {bi("nameHindi").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("nameHindi").secondary}</span>
            </Label>
            <Input
              id="nameHindi"
              placeholder="जैसे: रमेश कुमार"
              className="h-12 font-hindi tap-target"
              {...field("nameHindi")}
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("role").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("role").secondary}</span>
            </Label>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((prev) => ({ ...prev, role: v as Role }))}
            >
              <SelectTrigger className="h-12 tap-target">
                <SelectValue placeholder="Select role / पद चुनें" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.employee}>
                  {bi("employee").primary} · {bi("employee").secondary}
                </SelectItem>
                <SelectItem value={Role.supervisor}>
                  {bi("supervisor").primary} · {bi("supervisor").secondary}
                </SelectItem>
                <SelectItem value={Role.management}>
                  {bi("management").primary} · {bi("management").secondary}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("department").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("department").secondary}</span>
            </Label>
            <Select
              value={form.department}
              onValueChange={(v) => setForm((prev) => ({ ...prev, department: v }))}
            >
              <SelectTrigger className="h-12 tap-target">
                <SelectValue placeholder="Select department / विभाग चुनें" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Branch */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {bi("branch").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("branch").secondary}</span>
            </Label>
            {branches && branches.length > 0 ? (
              <Select
                value={form.branch}
                onValueChange={(v) => setForm((prev) => ({ ...prev, branch: v }))}
              >
                <SelectTrigger className="h-12 tap-target" disabled={branchesLoading}>
                  <SelectValue placeholder="Select branch / शाखा चुनें" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id.toString()} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  value={form.branch}
                  onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
                  placeholder="Enter branch name / शाखा का नाम"
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 tap-target"
                />
                {!branchesLoading && (
                  <p className="text-xs text-muted-foreground font-hindi">
                    {bi("noBranches").secondary}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Employee ID */}
          <div className="space-y-1.5">
            <Label htmlFor="empId" className="text-sm font-medium">
              {bi("employeeId").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("employeeId").secondary}</span>
            </Label>
            <Input
              id="empId"
              placeholder="e.g. WC-001"
              {...field("employeeId")}
              className="h-12 tap-target"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              {bi("phone").primary}
              <span className="text-xs text-muted-foreground font-hindi ml-1.5">{bi("phone").secondary}</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              {...field("phone")}
              className="h-12 tap-target"
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid || isPending}
            className="w-full h-14 text-base font-semibold rounded-xl wine-gradient text-white shadow-wine tap-target mt-2"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{tx("saving")}</>
            ) : (
              <>{bi("save").primary} · {bi("save").secondary}</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
