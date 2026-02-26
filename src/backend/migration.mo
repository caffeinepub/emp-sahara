import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Set "mo:core/Set";

module {
  type Role = {
    #employee;
    #supervisor;
    #management;
  };

  type AttendanceStatus = {
    #present;
    #absent;
    #late;
    #onLeave;
  };

  type TaskStatus = {
    #pending;
    #inProgress;
    #completed;
    #blocked;
  };

  type TaskPriority = {
    #routine;
    #urgent;
  };

  type UserProfile = {
    id : Principal;
    name : Text;
    nameHindi : Text;
    role : Role;
    department : Text;
    branch : Text;
    employeeId : Text;
    phone : Text;
    isActive : Bool;
    points : Nat;
  };

  type AttendanceRecord = {
    checkIn : ?Time.Time;
    checkOut : ?Time.Time;
    status : AttendanceStatus;
    date : Text;
  };

  type Task = {
    id : Nat;
    title : Text;
    titleHindi : Text;
    description : Text;
    descriptionHindi : Text;
    assignedTo : Principal;
    dueDate : Time.Time;
    priority : TaskPriority;
    branch : Text;
    status : TaskStatus;
    completionNote : ?Text;
    approved : ?Bool;
    approvalReason : ?Text;
  };

  type LeaveBalance = {
    sick : Nat;
    casual : Nat;
    earned : Nat;
    emergency : Nat;
  };

  type Announcement = {
    id : Nat;
    title : Text;
    titleHindi : Text;
    body : Text;
    bodyHindi : Text;
    targetBranch : Text;
    createdAt : Time.Time;
  };

  type LeaderboardEntry = {
    principal : Principal;
    name : Text;
    nameHindi : Text;
    points : Nat;
    rank : Nat;
    branch : Text;
  };

  type Branch = {
    id : Nat;
    name : Text;
  };

  type DigitalIdStatus = {
    #none;
    #pending;
    #approved;
    #rejected;
  };

  type DigitalIdCard = {
    employeeId : Principal;
    isActive : Bool;
    approvedAt : Time.Time;
    validUntil : Time.Time;
    rejectedReason : ?Text;
  };

  type RegistrationRequest = {
    requester : Principal;
    name : Text;
    nameHindi : Text;
    role : Role;
    department : Text;
    branch : Text;
    phone : Text;
    employeeId : Text;
    status : {
      #pending;
      #approved;
      #rejected;
    };
    rejectedReason : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    attendanceRecords : Map.Map<(Principal, Text), AttendanceRecord>;
    tasks : Map.Map<Nat, Task>;
    leaveBalances : Map.Map<Principal, LeaveBalance>;
    announcements : Map.Map<Nat, Announcement>;
    readAnnouncements : Map.Map<(Principal, Nat), Bool>;
    branches : Map.Map<Nat, Branch>;
    nextTaskId : Nat;
    nextBranchId : Nat;
    nextAnnouncementId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    attendanceRecords : Map.Map<(Principal, Text), AttendanceRecord>;
    tasks : Map.Map<Nat, Task>;
    leaveBalances : Map.Map<Principal, LeaveBalance>;
    announcements : Map.Map<Nat, Announcement>;
    readAnnouncements : Map.Map<(Principal, Nat), Bool>;
    branches : Map.Map<Nat, Branch>;
    nextTaskId : Nat;
    nextBranchId : Nat;
    nextAnnouncementId : Nat;
    digitalIdCards : Map.Map<Principal, DigitalIdCard>;
    digitalIdStatuses : Map.Map<Principal, DigitalIdStatus>;
    registrationRequests : Map.Map<Principal, RegistrationRequest>;
  };

  public func run(old : OldActor) : NewActor {
    { old with
      digitalIdCards = Map.empty<Principal, DigitalIdCard>();
      digitalIdStatuses = Map.empty<Principal, DigitalIdStatus>();
      registrationRequests = Map.empty<Principal, RegistrationRequest>();
    };
  };
};
