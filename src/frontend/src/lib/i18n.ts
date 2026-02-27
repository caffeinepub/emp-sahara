export type Language = "en" | "hi";

export const LANG_KEY = "winery_lang";

export function getStoredLang(): Language {
  return (localStorage.getItem(LANG_KEY) as Language) || "hi";
}

export function storeLang(lang: Language) {
  localStorage.setItem(LANG_KEY, lang);
}

export const t = {
  // App
  appName:      { en: "EMP Sahara", hi: "ईएमपी सहारा" },
  tagline:      { en: "Employee Management System", hi: "कर्मचारी प्रबंधन प्रणाली" },

  // Navigation
  home:         { en: "Home", hi: "घर" },
  attendance:   { en: "Attendance", hi: "उपस्थिति" },
  tasks:        { en: "Tasks", hi: "काम" },
  rewards:      { en: "Rewards", hi: "इनाम" },
  profile:      { en: "Profile", hi: "प्रोफ़ाइल" },

  // Auth
  login:        { en: "Login", hi: "लॉगिन" },
  logout:       { en: "Logout", hi: "लॉगआउट" },
  loggingIn:    { en: "Logging in…", hi: "लॉगिन हो रहा है…" },
  loginTitle:   { en: "Welcome to EMP Sahara", hi: "ईएमपी सहारा में आपका स्वागत" },
  loginSubtitle:{ en: "Sign in to manage your work", hi: "अपना काम प्रबंधित करने के लिए साइन इन करें" },

  // Profile setup
  profileSetup:     { en: "Complete Your Profile", hi: "अपनी प्रोफ़ाइल पूरी करें" },
  profileSetupSub:  { en: "Help us get to know you", hi: "हमें आपसे मिलने दें" },
  name:             { en: "Full Name", hi: "पूरा नाम" },
  nameHindi:        { en: "Name in Hindi", hi: "हिंदी में नाम" },
  role:             { en: "Role", hi: "पद" },
  department:       { en: "Department", hi: "विभाग" },
  branch:           { en: "Branch", hi: "शाखा" },
  employeeId:       { en: "Employee ID", hi: "कर्मचारी आईडी" },
  phone:            { en: "Phone Number", hi: "फोन नंबर" },
  save:             { en: "Save Profile", hi: "प्रोफ़ाइल सेव करें" },
  saving:           { en: "Saving…", hi: "सेव हो रहा है…" },
  saved:            { en: "Profile saved!", hi: "प्रोफ़ाइल सेव हो गई!" },

  // Roles
  employee:     { en: "Employee", hi: "कर्मचारी" },
  supervisor:   { en: "Supervisor", hi: "पर्यवेक्षक" },
  management:   { en: "Management", hi: "प्रबंधन" },

  // Home
  goodMorning:  { en: "Good Morning", hi: "सुप्रभात" },
  goodAfternoon:{ en: "Good Afternoon", hi: "नमस्कार" },
  goodEvening:  { en: "Good Evening", hi: "शुभ संध्या" },
  todayStatus:  { en: "Today's Status", hi: "आज की स्थिति" },
  pointsMonth:  { en: "Points This Month", hi: "इस माह के अंक" },
  tasksPending: { en: "Tasks Pending", hi: "लंबित काम" },
  leaveBalance: { en: "Leave Balance", hi: "अवकाश शेष" },
  announcements:{ en: "Announcements", hi: "सूचनाएं" },
  noAnnouncements: { en: "No announcements", hi: "कोई सूचना नहीं" },
  days:         { en: "days", hi: "दिन" },
  pts:          { en: "pts", hi: "अंक" },

  // Attendance
  checkIn:      { en: "Check In", hi: "उपस्थिति दर्ज करें" },
  checkOut:     { en: "Check Out", hi: "छुट्टी दर्ज करें" },
  checkedIn:    { en: "Checked In", hi: "उपस्थित हैं" },
  notCheckedIn: { en: "Not Checked In", hi: "उपस्थित नहीं हैं" },
  todayAttendance: { en: "Today", hi: "आज" },
  attendanceHistory: { en: "Attendance History", hi: "उपस्थिति इतिहास" },
  noAttendance: { en: "No attendance records", hi: "कोई उपस्थिति रिकॉर्ड नहीं" },

  // Status
  present:      { en: "Present", hi: "हाजिर" },
  late:         { en: "Late", hi: "देर से" },
  absent:       { en: "Absent", hi: "अनुपस्थित" },
  onLeave:      { en: "On Leave", hi: "छुट्टी पर" },

  // Tasks
  myTasks:      { en: "My Tasks", hi: "मेरे काम" },
  teamTasks:    { en: "Team Tasks", hi: "टीम के काम" },
  createTask:   { en: "Create Task", hi: "काम बनाएं" },
  titleEn:      { en: "Title (English)", hi: "शीर्षक (अंग्रेज़ी)" },
  titleHi:      { en: "Title (Hindi)", hi: "शीर्षक (हिंदी)" },
  descEn:       { en: "Description (English)", hi: "विवरण (अंग्रेज़ी)" },
  descHi:       { en: "Description (Hindi)", hi: "विवरण (हिंदी)" },
  assignedTo:   { en: "Assigned To (Principal)", hi: "किसे सौंपें (Principal)" },
  dueDate:      { en: "Due Date", hi: "अंतिम तिथि" },
  priority:     { en: "Priority", hi: "प्राथमिकता" },
  routine:      { en: "Routine", hi: "सामान्य" },
  urgent:       { en: "Urgent", hi: "अत्यावश्यक" },
  pending:      { en: "Pending", hi: "लंबित" },
  inProgress:   { en: "In Progress", hi: "जारी है" },
  completed:    { en: "Completed", hi: "पूर्ण" },
  blocked:      { en: "Blocked", hi: "बाधित" },
  completionNote: { en: "Completion Note", hi: "पूर्णता टिप्पणी" },
  updateStatus: { en: "Update Status", hi: "स्थिति अपडेट करें" },
  approve:      { en: "Approve", hi: "स्वीकृत करें" },
  reject:       { en: "Reject", hi: "अस्वीकृत करें" },
  reason:       { en: "Reason", hi: "कारण" },
  noTasks:      { en: "No tasks assigned", hi: "कोई काम नहीं सौंपा गया" },
  taskCreated:  { en: "Task created!", hi: "काम बना दिया गया!" },

  // Rewards
  yourPoints:   { en: "Your Points", hi: "आपके अंक" },
  yourRank:     { en: "Your Rank", hi: "आपकी रैंक" },
  leaderboard:  { en: "Leaderboard", hi: "लीडरबोर्ड" },
  pointsGuide:  { en: "Points Guide", hi: "अंक मार्गदर्शिका" },
  routineTask:  { en: "Routine task approved", hi: "सामान्य काम स्वीकृत" },
  urgentTask:   { en: "Urgent task approved", hi: "अत्यावश्यक काम स्वीकृत" },
  rank:         { en: "Rank", hi: "रैंक" },
  points:       { en: "Points", hi: "अंक" },

  // Profile / Wallet
  myWallet:     { en: "My Digital Wallet", hi: "मेरा डिजिटल वॉलेट" },
  activeCard:   { en: "Active", hi: "सक्रिय" },
  inactiveCard: { en: "Inactive", hi: "निष्क्रिय" },
  sick:         { en: "Sick", hi: "बीमार" },
  casual:       { en: "Casual", hi: "आकस्मिक" },
  earned:       { en: "Earned", hi: "अर्जित" },
  emergency:    { en: "Emergency", hi: "आपातकाल" },
  leaveBalanceTitle: { en: "Leave Balance", hi: "अवकाश शेष" },
  performanceSummary: { en: "Performance", hi: "प्रदर्शन" },
  deactivate:   { en: "Deactivate", hi: "निष्क्रिय करें" },
  manageStaff:  { en: "Manage Staff", hi: "स्टाफ प्रबंधन" },
  updateLeave:  { en: "Update Leave", hi: "अवकाश अपडेट करें" },
  allStaff:     { en: "All Staff", hi: "सभी कर्मचारी" },

  // Common
  loading:      { en: "Loading…", hi: "लोड हो रहा है…" },
  error:        { en: "Something went wrong", hi: "कुछ गलत हुआ" },
  retry:        { en: "Try Again", hi: "फिर कोशिश करें" },
  cancel:       { en: "Cancel", hi: "रद्द करें" },
  confirm:      { en: "Confirm", hi: "पुष्टि करें" },
  submit:       { en: "Submit", hi: "जमा करें" },
  submitting:   { en: "Submitting…", hi: "जमा हो रहा है…" },
  viewAll:      { en: "View All", hi: "सभी देखें" },

  // Branch Management
  manageBranches: { en: "Manage Branches", hi: "शाखा प्रबंधन" },
  addBranch:      { en: "Add Branch", hi: "शाखा जोड़ें" },
  branchName:     { en: "Branch Name", hi: "शाखा का नाम" },
  noBranches:     { en: "No branches added yet", hi: "अभी कोई शाखा नहीं जोड़ी गई" },
  branchAdded:    { en: "Branch added", hi: "शाखा जोड़ दी गई" },
  branchUpdated:  { en: "Branch updated", hi: "शाखा अपडेट हो गई" },
  branchDeleted:  { en: "Branch deleted", hi: "शाखा हटा दी गई" },
  editBranch:     { en: "Edit", hi: "संपादित करें" },
  deleteBranch:   { en: "Delete", hi: "हटाएं" },

  // Announcement types
  markRead:     { en: "Mark as Read", hi: "पढ़ा हुआ चिह्नित करें" },
  createAnnouncement: { en: "New Announcement", hi: "नई सूचना" },
  targetBranch: { en: "Target Branch (all = all branches)", hi: "लक्षित शाखा (all = सभी शाखाएं)" },
  bodyEn:       { en: "Body (English)", hi: "सामग्री (अंग्रेज़ी)" },
  bodyHi:       { en: "Body (Hindi)", hi: "सामग्री (हिंदी)" },

  // Registration
  registrationTitle:    { en: "Request Access", hi: "पहुंच के लिए आवेदन करें" },
  registrationSub:      { en: "Submit your details for management approval", hi: "प्रबंधन की मंजूरी के लिए अपना विवरण जमा करें" },
  newEmployee:          { en: "I'm a new employee — request access", hi: "मैं नया कर्मचारी हूं — पहुंच के लिए आवेदन करें" },
  alreadyRequested:     { en: "Already requested access", hi: "पहले ही आवेदन किया है" },
  pendingApproval:      { en: "Pending Approval", hi: "अनुमोदन प्रतीक्षित" },
  pendingMessage:       { en: "Your registration request is being reviewed by management. Please check back later.", hi: "आपका पंजीकरण अनुरोध प्रबंधन द्वारा समीक्षा में है। कृपया बाद में जांचें।" },
  approvedMessage:      { en: "Your registration has been approved! Please refresh to continue.", hi: "आपका पंजीकरण स्वीकृत हो गया! जारी रखने के लिए कृपया रिफ्रेश करें।" },
  rejectedMessage:      { en: "Your registration was rejected.", hi: "आपका पंजीकरण अस्वीकृत कर दिया गया।" },
  rejectionReason:      { en: "Reason", hi: "कारण" },
  requestSubmitted:     { en: "Request submitted!", hi: "आवेदन जमा हो गया!" },
  checkStatus:          { en: "Check Status", hi: "स्थिति जांचें" },

  // Digital ID
  digitalId:            { en: "Digital ID Card", hi: "डिजिटल आईडी कार्ड" },
  requestDigitalId:     { en: "Request Digital ID", hi: "डिजिटल आईडी के लिए आवेदन करें" },
  digitalIdPending:     { en: "Request Pending", hi: "आवेदन लंबित" },
  digitalIdActive:      { en: "Active", hi: "सक्रिय" },
  digitalIdInactive:    { en: "Inactive", hi: "निष्क्रिय" },
  validUntil:           { en: "Valid Until", hi: "तक वैध" },
  idRequested:          { en: "Digital ID requested!", hi: "डिजिटल आईडी के लिए आवेदन हो गया!" },
  designation:          { en: "Designation", hi: "पद" },
  viewOnly:             { en: "View only — not shareable", hi: "केवल देखने के लिए — साझा नहीं किया जा सकता" },

  // Management Panel
  employeeRequests:     { en: "New Employee Requests", hi: "नए कर्मचारी आवेदन" },
  digitalIdRequests:    { en: "Digital ID Requests", hi: "डिजिटल आईडी आवेदन" },
  issuedIds:            { en: "All Issued IDs", hi: "सभी जारी आईडी" },
  noRequests:           { en: "No pending requests", hi: "कोई लंबित आवेदन नहीं" },
  approvedSuccess:      { en: "Approved successfully", hi: "सफलतापूर्वक स्वीकृत किया गया" },
  rejectedSuccess:      { en: "Rejected successfully", hi: "सफलतापूर्वक अस्वीकृत किया गया" },
  enterReason:          { en: "Enter rejection reason", hi: "अस्वीकृति का कारण लिखें" },
  rejectWithReason:     { en: "Reject with reason", hi: "कारण सहित अस्वीकृत करें" },

  // Announcements Panel (management)
  sendAnnouncement:     { en: "Send Announcement", hi: "घोषणा भेजें" },
  announcementsPanel:   { en: "Announcements", hi: "घोषणाएं" },
  allBranchesOption:    { en: "All Branches", hi: "सभी शाखाएं" },
  announcementSent:     { en: "Announcement sent!", hi: "घोषणा भेजी गई!" },
  noAnnouncementsYet:   { en: "No announcements yet", hi: "अभी कोई घोषणा नहीं" },
  titleEn_ann:          { en: "Title (English)", hi: "शीर्षक (अंग्रेज़ी)" },
  titleHi_ann:          { en: "Title (Hindi)", hi: "शीर्षक (हिंदी)" },
  bodyEn_ann:           { en: "Message (English)", hi: "संदेश (अंग्रेज़ी)" },
  bodyHi_ann:           { en: "Message (Hindi)", hi: "संदेश (हिंदी)" },
  targetBranchLabel:    { en: "Target", hi: "लक्षित शाखा" },

  // All Employees Attendance
  allEmployees:         { en: "All Employees", hi: "सभी कर्मचारी" },
  myAttendance:         { en: "My Attendance", hi: "मेरी उपस्थिति" },
  filterBranch:         { en: "Filter by Branch", hi: "शाखा से फ़िल्टर करें" },
  allBranches:          { en: "All Branches", hi: "सभी शाखाएं" },
  noDataYet:            { en: "No attendance data", hi: "कोई उपस्थिति डेटा नहीं" },
  checkinTime:          { en: "Check-in", hi: "चेक-इन" },
  checkoutTime:         { en: "Check-out", hi: "चेक-आउट" },

  // Manage Leave Panel
  manageLeaves:         { en: "Manage Leaves", hi: "छुट्टी प्रबंधन" },
  editLeaves:           { en: "Edit Leaves", hi: "छुट्टी संपादित करें" },
  searchEmployees:      { en: "Search employees", hi: "कर्मचारी खोजें" },
  leaveNote:            { en: "Reason / Note (optional)", hi: "कारण / टिप्पणी (वैकल्पिक)" },
  leaveUpdated:         { en: "Leave balance updated!", hi: "छुट्टी शेष अपडेट हो गया!" },
  noEmployees:          { en: "No employees found", hi: "कोई कर्मचारी नहीं मिला" },
  currentBalance:       { en: "Current Balance", hi: "वर्तमान शेष" },

  // Important Files
  importantFiles:       { en: "Files", hi: "फाइलें" },
  filesSection:         { en: "Important Files", hi: "महत्वपूर्ण फाइलें" },
  manageCategories:     { en: "Manage Categories", hi: "श्रेणियां प्रबंधित करें" },
  addCategory:          { en: "Add Category", hi: "श्रेणी जोड़ें" },
  categoryName:         { en: "Category Name", hi: "श्रेणी का नाम" },
  allowedRoles:         { en: "Who Can View", hi: "कौन देख सकता है" },
  noCategories:         { en: "No categories yet", hi: "अभी कोई श्रेणी नहीं" },
  uploadFile:           { en: "Upload File", hi: "फाइल अपलोड करें" },
  uploading:            { en: "Uploading…", hi: "अपलोड हो रहा है…" },
  downloadFile:         { en: "Download", hi: "डाउनलोड" },
  deleteFile:           { en: "Delete", hi: "हटाएं" },
  noFiles:              { en: "No files in this category", hi: "इस श्रेणी में कोई फाइल नहीं" },
  categoryCreated:      { en: "Category created!", hi: "श्रेणी बना दी गई!" },
  fileUploaded:         { en: "File uploaded!", hi: "फाइल अपलोड हो गई!" },
  fileDeleted:          { en: "File deleted", hi: "फाइल हटा दी गई" },
  categoryDeleted:      { en: "Category deleted", hi: "श्रेणी हटा दी गई" },
  editCategory:         { en: "Edit Category", hi: "श्रेणी संपादित करें" },
  restricted:           { en: "Restricted", hi: "प्रतिबंधित" },
  accessible:           { en: "Accessible", hi: "उपलब्ध" },
  selectCategory:       { en: "Select Category", hi: "श्रेणी चुनें" },
  chooseFile:           { en: "Choose file…", hi: "फाइल चुनें…" },
  uploadTo:             { en: "Upload to", hi: "अपलोड करें" },
};

export type TKey = keyof typeof t;

export function getText(key: TKey, lang: Language): string {
  return t[key][lang];
}

/** Bilingual label: primary + secondary smaller */
export function biLabel(key: TKey, lang: Language): { primary: string; secondary: string } {
  const primary = t[key][lang];
  const secondary = t[key][lang === "en" ? "hi" : "en"];
  return { primary, secondary };
}
