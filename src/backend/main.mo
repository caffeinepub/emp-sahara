import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// with migration for data migration and upgrade safety
(with migration = Migration.run)
actor {
  ////////////////////////////////
  // TYPES
  ////////////////////////////////

  public type Role = {
    #employee;
    #supervisor;
    #management;
  };

  public type AttendanceStatus = {
    #present;
    #absent;
    #late;
    #onLeave;
  };

  public type TaskStatus = {
    #pending;
    #inProgress;
    #completed;
    #blocked;
  };

  public type LeaveType = {
    #sick;
    #casual;
    #earned;
    #emergency;
  };

  public type TaskPriority = {
    #routine;
    #urgent;
  };

  public type UserProfile = {
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

  public type AttendanceRecord = {
    checkIn : ?Time.Time;
    checkOut : ?Time.Time;
    status : AttendanceStatus;
    date : Text;
  };

  public type Task = {
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

  public type LeaveBalance = {
    sick : Nat;
    casual : Nat;
    earned : Nat;
    emergency : Nat;
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    titleHindi : Text;
    body : Text;
    bodyHindi : Text;
    targetBranch : Text;
    createdAt : Time.Time;
  };

  public type LeaderboardEntry = {
    principal : Principal;
    name : Text;
    nameHindi : Text;
    points : Nat;
    rank : Nat;
    branch : Text;
  };

  public type Branch = {
    id : Nat;
    name : Text;
  };

  public type DigitalIdStatus = {
    #none;
    #pending;
    #approved;
    #rejected;
  };

  public type DigitalIdCard = {
    employeeId : Principal;
    isActive : Bool;
    approvedAt : Time.Time;
    validUntil : Time.Time;
    rejectedReason : ?Text;
  };

  public type RegistrationRequest = {
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

  ////////////////////////////////
  // AUTHORIZATION
  ////////////////////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  ////////////////////////////////
  // STORAGE
  ////////////////////////////////

  var nextTaskId = 1;
  var nextBranchId = 1;
  var nextAnnouncementId = 1;

  // 1. Change arrays to persistent Map / List structures
  let userProfiles = Map.empty<Principal, UserProfile>();
  let attendanceRecords = Map.empty<(Principal, Text), AttendanceRecord>();
  let tasks = Map.empty<Nat, Task>();
  let leaveBalances = Map.empty<Principal, LeaveBalance>();
  let announcements = Map.empty<Nat, Announcement>();
  let readAnnouncements = Map.empty<(Principal, Nat), Bool>();
  let branches = Map.empty<Nat, Branch>();
  let digitalIdCards = Map.empty<Principal, DigitalIdCard>();
  let digitalIdStatuses = Map.empty<Principal, DigitalIdStatus>();
  let registrationRequests = Map.empty<Principal, RegistrationRequest>();

  ////////////////////////////////
  // HELPERS
  ////////////////////////////////

  func maxNat(a : Nat, b : Nat) : Nat {
    if (a > b) { a } else { b };
  };

  func isManagement(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#management) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isSupervisorOrManagement(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#supervisor) { true };
          case (#management) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func getUserBranch(caller : Principal) : ?Text {
    switch (userProfiles.get(caller)) {
      case (?profile) { ?profile.branch };
      case (null) { null };
    };
  };

  func isSameBranch(caller : Principal, targetBranch : Text) : Bool {
    switch (getUserBranch(caller)) {
      case (?branch) { branch == targetBranch };
      case (null) { false };
    };
  };

  // CUSTOM COMPARISON FUNCTIONS
  module Tasks {
    public func compareByDueDate(task1 : Task, task2 : Task) : Order.Order {
      Int.compare(task1.dueDate, task2.dueDate);
    };

    public func compareByPriority(task1 : Task, task2 : Task) : Order.Order {
      switch (task1.priority, task2.priority) {
        case (#routine, #urgent) { #less };
        case (#urgent, #routine) { #greater };
        case (_) { compareByDueDate(task1, task2) };
      };
    };
  };

  module Branches {
    public func compareByName(branch1 : Branch, branch2 : Branch) : Order.Order {
      Text.compare(branch1.name, branch2.name);
    };
  };

  module LeaderboardEntry {
    public func compareByBranch(entry1 : LeaderboardEntry, entry2 : LeaderboardEntry) : Order.Order {
      switch (Text.compare(entry1.branch, entry2.branch)) {
        case (#equal) { Nat.compare(entry1.points, entry2.points) };
        case (order) { order };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not isManagement(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are management");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Verify the profile id matches the caller
    if (profile.id != caller) {
      Runtime.trap("Unauthorized: Cannot save profile for another user");
    };
    userProfiles.add(caller, profile);
  };

  func getPointsReward(priority : TaskPriority) : Nat {
    switch (priority) {
      case (#routine) { 10 };
      case (#urgent) { 25 };
    };
  };

  /// Gets the next available task ID.
  public query ({ caller }) func getNextTaskId() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get next task ID");
    };
    if (not isSupervisorOrManagement(caller)) {
      Runtime.trap("Unauthorized: Only supervisors or management can get next task ID");
    };
    nextTaskId;
  };

  /// Gets the points reward for a given task priority.
  public query ({ caller }) func getPointsRewardForTask(priority : TaskPriority) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get points reward");
    };
    getPointsReward(priority);
  };

  /// Gets the next available announcement ID.
  public query ({ caller }) func getNextAnnouncementId() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get next announcement ID");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can get next announcement ID");
    };
    nextAnnouncementId;
  };

  /// Gets the leave balance for a given principal.
  public query ({ caller }) func getLeaveBalanceForPrincipal(employeeId : Principal) : async LeaveBalance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access leave balance");
    };
    if (caller != employeeId and not isManagement(caller)) {
      Runtime.trap("Unauthorized: Can only view your own leave balance unless you are management");
    };
    switch (userProfiles.get(employeeId)) {
      case (null) {
        Runtime.trap("Employee does not exist");
      };
      case (?_) {
        switch (leaveBalances.get(employeeId)) {
          case (null) {
            { sick = 0; casual = 0; earned = 0; emergency = 0 };
          };
          case (?balance) { balance };
        };
      };
    };
  };

  ////////////////////////////////
  // BRANCH MANAGEMENT
  ////////////////////////////////

  public shared ({ caller }) func addBranch(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add branches");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can add branches");
    };
    let branch : Branch = {
      id = nextBranchId;
      name;
    };
    branches.add(nextBranchId, branch);
    nextBranchId += 1;
    branch.id;
  };

  public shared ({ caller }) func updateBranch(id : Nat, name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update branches");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can update branches");
    };
    switch (branches.get(id)) {
      case (null) { Runtime.trap("Branch not found") };
      case (?_) {
        let updatedBranch : Branch = { id; name };
        branches.add(id, updatedBranch);
      };
    };
  };

  public shared ({ caller }) func deleteBranch(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete branches");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can delete branches");
    };
    switch (branches.get(id)) {
      case (null) { Runtime.trap("Branch not found") };
      case (?_) {
        branches.remove(id);
      };
    };
  };

  public query ({ caller }) func getBranches() : async [Branch] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get branches");
    };
    branches.values().toArray().sort(Branches.compareByName);
  };

  ////////////////////////////////
  // USER PROFILES
  ////////////////////////////////

  public shared ({ caller }) func createUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create user profiles");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can create user profiles");
    };
    userProfiles.add(profile.id, profile);
  };

  public shared ({ caller }) func updateUserProfile(userId : Principal, profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update user profiles");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can update user profiles");
    };
    switch (userProfiles.get(userId)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?_) {
        // Verify profile.id matches userId
        if (profile.id != userId) {
          Runtime.trap("Profile id must match userId");
        };
        userProfiles.add(userId, profile);
      };
    };
  };

  public shared ({ caller }) func deactivateUser(userId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can deactivate users");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can deactivate users");
    };
    switch (userProfiles.get(userId)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?profile) {
        let updatedProfile = {
          id = profile.id;
          name = profile.name;
          nameHindi = profile.nameHindi;
          role = profile.role;
          department = profile.department;
          branch = profile.branch;
          employeeId = profile.employeeId;
          phone = profile.phone;
          isActive = false;
          points = profile.points;
        };
        userProfiles.add(userId, updatedProfile);
      };
    };
  };

  ////////////////////////////////
  // ATTENDANCE
  ////////////////////////////////

  public shared ({ caller }) func checkIn() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check in");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile does not exist");
      };
      case (?profile) {
        if (not profile.isActive) {
          Runtime.trap("User is not active");
        };
      };
    };
  };

  public shared ({ caller }) func checkOut() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check out");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile does not exist");
      };
      case (?profile) {
        if (not profile.isActive) {
          Runtime.trap("User is not active");
        };
      };
    };
  };

  public query ({ caller }) func getAttendanceHistory(userId : Principal) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get attendance history");
    };
    if (caller != userId) {
      if (not isSupervisorOrManagement(caller)) {
        Runtime.trap("Unauthorized: Can only view your own attendance history unless you are supervisor or management");
      };
      switch (userProfiles.get(userId)) {
        case (null) {
          Runtime.trap("User does not exist");
        };
        case (?targetProfile) {
          if (not isSameBranch(caller, targetProfile.branch) and not isManagement(caller)) {
            Runtime.trap("Unauthorized: Can only view attendance for employees in your branch");
          };
        };
      };
    };
    [];
  };

  public query ({ caller }) func getBranchAttendance(branch : Text) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get branch attendance");
    };
    if (not isSupervisorOrManagement(caller)) {
      Runtime.trap("Unauthorized: Only supervisor or management can get branch attendance");
    };
    if (not isSameBranch(caller, branch) and not isManagement(caller)) {
      Runtime.trap("Unauthorized: Can only view attendance for your own branch");
    };
    [];
  };

  ////////////////////////////////
  // TASKS
  ////////////////////////////////

  public shared ({ caller }) func createTask(
    title : Text,
    titleHindi : Text,
    description : Text,
    descriptionHindi : Text,
    assignedTo : Principal,
    dueDate : Time.Time,
    priority : TaskPriority,
    branch : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };
    if (not isSupervisorOrManagement(caller)) {
      Runtime.trap("Unauthorized: Only supervisors or management can create tasks");
    };
    if (not isSameBranch(caller, branch) and not isManagement(caller)) {
      Runtime.trap("Unauthorized: Can only create tasks for your own branch");
    };
    switch (userProfiles.get(assignedTo)) {
      case (null) {
        Runtime.trap("Assigned user does not exist");
      };
      case (?profile) {
        if (profile.branch != branch) {
          Runtime.trap("Cannot assign task to user from different branch");
        };
      };
    };
    0;
  };

  public query ({ caller }) func getAssignedTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get assigned tasks");
    };
    [];
  };

  public shared ({ caller }) func updateTaskStatus(
    taskId : Nat,
    status : TaskStatus,
    completionNote : ?Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update task status");
    };
    switch (tasks.get(taskId)) {
      case (null) {
        Runtime.trap("Task does not exist");
      };
      case (?task) {
        if (task.assignedTo != caller) {
          Runtime.trap("Unauthorized: Can only update status of tasks assigned to you");
        };
      };
    };
  };

  public shared ({ caller }) func approveTask(
    taskId : Nat,
    approved : Bool,
    reason : ?Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can approve tasks");
    };
    if (not isSupervisorOrManagement(caller)) {
      Runtime.trap("Unauthorized: Only supervisors or management can approve tasks");
    };
    switch (tasks.get(taskId)) {
      case (null) {
        Runtime.trap("Task does not exist");
      };
      case (?task) {
        if (not isSameBranch(caller, task.branch) and not isManagement(caller)) {
          Runtime.trap("Unauthorized: Can only approve tasks in your own branch");
        };
      };
    };
  };

  ////////////////////////////////
  // REWARD POINTS
  ////////////////////////////////

  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access leaderboard");
    };
    [];
  };

  public query ({ caller }) func getOwnPointsAndRank() : async { points : Nat; rank : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their points and rank");
    };
    { points = 0; rank = 0 };
  };

  public shared ({ caller }) func updatePoints(userId : Principal, points : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update points");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can update points");
    };
    switch (userProfiles.get(userId)) {
      case (null) {
        Runtime.trap("User does not exist");
      };
      case (?_) {};
    };
  };

  ////////////////////////////////
  // LEAVE MANAGEMENT
  ////////////////////////////////

  public query ({ caller }) func getLeaveBalance() : async LeaveBalance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access leave balance");
    };
    switch (leaveBalances.get(caller)) {
      case (null) {
        { sick = 0; casual = 0; earned = 0; emergency = 0 };
      };
      case (?balance) { balance };
    };
  };

  public shared ({ caller }) func updateLeaveBalance(
    employeeId : Principal,
    sick : Nat,
    casual : Nat,
    earned : Nat,
    emergency : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update leave balances");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can update leave balances");
    };
    switch (userProfiles.get(employeeId)) {
      case (null) {
        Runtime.trap("Employee does not exist");
      };
      case (?_) {
        let balance = {
          sick = sick;
          casual = casual;
          earned = earned;
          emergency = emergency;
        };
        leaveBalances.add(employeeId, balance);
      };
    };
  };

  ////////////////////////////////
  // ANNOUNCEMENTS
  ////////////////////////////////

  public shared ({ caller }) func createAnnouncement(
    title : Text,
    titleHindi : Text,
    body : Text,
    bodyHindi : Text,
    targetBranch : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create announcements");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can create announcements");
    };
    0;
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get all announcements");
    };
    [];
  };

  public shared ({ caller }) func markAnnouncementAsRead(announcementId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark announcement as read");
    };
    switch (announcements.get(announcementId)) {
      case (null) {
        Runtime.trap("Announcement does not exist");
      };
      case (?announcement) {
        switch (getUserBranch(caller)) {
          case (null) {
            Runtime.trap("User profile does not exist");
          };
          case (?userBranch) {
            if (announcement.targetBranch != "all" and announcement.targetBranch != userBranch) {
              Runtime.trap("Unauthorized: This announcement is not for your branch");
            };
          };
        };
      };
    };
  };

  ////////////////////////////////
  // DIGITAL ID CARDS
  ////////////////////////////////

  public shared ({ caller }) func submitDigitalIdRequest() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only active users can submit digital id requests");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile does not exist");
      };
      case (?profile) {
        if (not profile.isActive) {
          Runtime.trap("User is not active");
        };
        // Check if there's already a request or approved card
        switch (digitalIdStatuses.get(caller)) {
          case (?#pending) {
            Runtime.trap("Digital id request already pending");
          };
          case (?#approved) {
            Runtime.trap("Digital id card already approved");
          };
          case (_) {
            // Allow submission for #none or #rejected
            digitalIdStatuses.add(caller, #pending);
          };
        };
      };
    };
  };

  public shared ({ caller }) func approveDigitalIdRequest(employeeId : Principal, approved : Bool, reason : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only management can approve digital id requests");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can approve digital id requests");
    };
    switch (digitalIdStatuses.get(employeeId)) {
      case (?#pending) {
        if (approved) {
          let approvedId : DigitalIdCard = {
            employeeId = employeeId;
            isActive = true;
            approvedAt = Time.now();
            validUntil = Time.now() + 31536000000000000; //  one year
            rejectedReason = null;
          };
          digitalIdCards.add(employeeId, approvedId);
          digitalIdStatuses.add(employeeId, #approved);
        } else {
          let rejectedId : DigitalIdCard = {
            employeeId = employeeId;
            isActive = false;
            approvedAt = 0;
            validUntil = 0;
            rejectedReason = reason;
          };
          digitalIdCards.add(employeeId, rejectedId);
          digitalIdStatuses.add(employeeId, #rejected);
        };
      };
      case (_) {
        Runtime.trap("No pending digital id request found for this employee");
      };
    };
  };

  public query ({ caller }) func getMyDigitalId() : async ?DigitalIdCard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only active users can get digital ids");
    };
    digitalIdCards.get(caller);
  };

  public query ({ caller }) func getPendingDigitalIdRequests() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only management can get digital id requests");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can get digital id requests");
    };
    digitalIdStatuses.toArray().filter(func((_, status)) { status == #pending }).map(
      func((principal, _)) { principal }
    );
  };

  public query ({ caller }) func getAllDigitalIds() : async [DigitalIdCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only management can get digital ids");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can get digital ids");
    };
    digitalIdCards.values().toArray();
  };

  ////////////////////////////////
  // REGISTRATION REQUESTS
  ////////////////////////////////

  public shared ({ caller }) func submitRegistrationRequest(name : Text, nameHindi : Text, role : Role, department : Text, branch : Text, phone : Text, employeeId : Text) : async () {
    // Check if caller already has a profile - if so, they cannot submit a registration request
    switch (userProfiles.get(caller)) {
      case (?_) {
        Runtime.trap("Unauthorized: User already has a profile");
      };
      case (null) {
        // Check if there's already a pending or approved request
        switch (registrationRequests.get(caller)) {
          case (?existingRequest) {
            switch (existingRequest.status) {
              case (#pending) {
                Runtime.trap("Registration request already pending");
              };
              case (#approved) {
                Runtime.trap("Registration request already approved");
              };
              case (#rejected) {
                // Allow resubmission after rejection
              };
            };
          };
          case (null) {};
        };
        let request : RegistrationRequest = {
          requester = caller;
          name;
          nameHindi;
          role;
          department;
          branch;
          phone;
          employeeId;
          status = #pending;
          rejectedReason = null;
        };
        registrationRequests.add(caller, request);
      };
    };
  };

  public query ({ caller }) func getMyRegistrationStatus() : async ?RegistrationRequest {
    // No authorization check - anyone can check their own registration status
    registrationRequests.get(caller);
  };

  public query ({ caller }) func getPendingRegistrationRequests() : async [RegistrationRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only management can get registration requests");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can get registration requests");
    };
    registrationRequests.values().toArray().filter(
      func(request) { request.status == #pending }
    );
  };

  public shared ({ caller }) func approveRegistrationRequest(requester : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only management can approve registration requests");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can approve registration requests");
    };
    switch (registrationRequests.get(requester)) {
      case (?request) {
        if (request.status == #approved) {
          Runtime.trap("Registration request already approved");
        };
        if (request.status != #pending) {
          Runtime.trap("Can only approve pending registration requests");
        };
        let profile : UserProfile = {
          id = requester;
          name = request.name;
          nameHindi = request.nameHindi;
          role = request.role;
          department = request.department;
          branch = request.branch;
          employeeId = request.employeeId;
          phone = request.phone;
          isActive = true;
          points = 0;
        };
        userProfiles.add(requester, profile);
        let updatedRequest : RegistrationRequest = {
          requester = request.requester;
          name = request.name;
          nameHindi = request.nameHindi;
          role = request.role;
          department = request.department;
          branch = request.branch;
          phone = request.phone;
          employeeId = request.employeeId;
          status = #approved;
          rejectedReason = null;
        };
        registrationRequests.add(requester, updatedRequest);
        ?profile;
      };
      case (null) { Runtime.trap("Registration request not found") };
    };
  };

  public shared ({ caller }) func rejectRegistrationRequest(requester : Principal, reason : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only management can reject registration requests");
    };
    if (not isManagement(caller)) {
      Runtime.trap("Unauthorized: Only management can reject registration requests");
    };
    switch (registrationRequests.get(requester)) {
      case (null) {
        Runtime.trap("Registration request does not exist");
      };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Can only reject pending registration requests");
        };
        let updatedRequest : RegistrationRequest = {
          requester = request.requester;
          name = request.name;
          nameHindi = request.nameHindi;
          role = request.role;
          department = request.department;
          branch = request.branch;
          phone = request.phone;
          employeeId = request.employeeId;
          status = #rejected;
          rejectedReason = ?reason;
        };
        registrationRequests.add(requester, updatedRequest);
      };
    };
  };
};
