
import { format, addDays, subDays } from "date-fns";

export type LeaveType = 'PTO' | 'Sick' | 'Compassionate' | 'Maternity' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Staff' | 'Manager' | 'Admin';
  department: string;
  avatarUrl: string;
  leaveBalances: {
    PTO: number;
    Sick: number;
    Compassionate: number;
    Maternity: number;
    Unpaid: number;
  };
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  attachmentUrl?: string;
  submittedAt: string;
  approvedRejectedAt?: string;
  approvedRejectedBy?: string;
  comments?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
}

// Dummy Users
export const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@africahr.com",
    role: "Staff",
    department: "Engineering",
    avatarUrl: "https://ui-avatars.com/api/?name=John+Doe&background=059669&color=fff",
    leaveBalances: {
      PTO: 15.5,
      Sick: 10,
      Compassionate: 5,
      Maternity: 0,
      Unpaid: 0,
    },
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@africahr.com",
    role: "Manager",
    department: "Engineering",
    avatarUrl: "https://ui-avatars.com/api/?name=Jane+Smith&background=8b5cf6&color=fff",
    leaveBalances: {
      PTO: 18.2,
      Sick: 10,
      Compassionate: 5,
      Maternity: 90,
      Unpaid: 0,
    },
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@africahr.com",
    role: "Admin",
    department: "Human Resources",
    avatarUrl: "https://ui-avatars.com/api/?name=Robert+Johnson&background=ef4444&color=fff",
    leaveBalances: {
      PTO: 20,
      Sick: 10,
      Compassionate: 5,
      Maternity: 0,
      Unpaid: 0,
    },
  },
  {
    id: "4",
    name: "Maria Garcia",
    email: "maria.garcia@africahr.com",
    role: "Staff",
    department: "Marketing",
    avatarUrl: "https://ui-avatars.com/api/?name=Maria+Garcia&background=ec4899&color=fff",
    leaveBalances: {
      PTO: 12.8,
      Sick: 7,
      Compassionate: 5,
      Maternity: 0,
      Unpaid: 0,
    },
  },
  {
    id: "5",
    name: "David Williams",
    email: "david.williams@africahr.com",
    role: "Staff",
    department: "Finance",
    avatarUrl: "https://ui-avatars.com/api/?name=David+Williams&background=f59e0b&color=fff",
    leaveBalances: {
      PTO: 16.6,
      Sick: 10,
      Compassionate: 5,
      Maternity: 0,
      Unpaid: 0,
    },
  },
];

const today = new Date();
const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

// Dummy Leave Requests
export const leaveRequests: LeaveRequest[] = [
  {
    id: "1",
    userId: "1",
    leaveType: "PTO",
    startDate: formatDate(addDays(today, 5)),
    endDate: formatDate(addDays(today, 10)),
    reason: "Annual vacation",
    status: "Approved",
    submittedAt: formatDate(subDays(today, 15)),
    approvedRejectedAt: formatDate(subDays(today, 10)),
    approvedRejectedBy: "2",
  },
  {
    id: "2",
    userId: "4",
    leaveType: "Sick",
    startDate: formatDate(subDays(today, 3)),
    endDate: formatDate(subDays(today, 1)),
    reason: "Flu",
    status: "Approved",
    attachmentUrl: "medical-certificate.pdf",
    submittedAt: formatDate(subDays(today, 4)),
    approvedRejectedAt: formatDate(subDays(today, 4)),
    approvedRejectedBy: "3",
  },
  {
    id: "3",
    userId: "2",
    leaveType: "Maternity",
    startDate: formatDate(addDays(today, 30)),
    endDate: formatDate(addDays(today, 120)),
    reason: "Maternity leave",
    status: "Pending",
    submittedAt: formatDate(subDays(today, 2)),
  },
  {
    id: "4",
    userId: "5",
    leaveType: "PTO",
    startDate: formatDate(addDays(today, 15)),
    endDate: formatDate(addDays(today, 19)),
    reason: "Family vacation",
    status: "Pending",
    submittedAt: formatDate(today),
  },
  {
    id: "5",
    userId: "1",
    leaveType: "Compassionate",
    startDate: formatDate(subDays(today, 10)),
    endDate: formatDate(subDays(today, 7)),
    reason: "Family emergency",
    status: "Approved",
    submittedAt: formatDate(subDays(today, 11)),
    approvedRejectedAt: formatDate(subDays(today, 11)),
    approvedRejectedBy: "2",
  },
  {
    id: "6",
    userId: "4",
    leaveType: "PTO",
    startDate: formatDate(addDays(today, 2)),
    endDate: formatDate(addDays(today, 2)),
    reason: "Personal appointment",
    status: "Rejected",
    submittedAt: formatDate(subDays(today, 5)),
    approvedRejectedAt: formatDate(subDays(today, 3)),
    approvedRejectedBy: "3",
    comments: "Critical project deadline on this day",
  },
];

// Dummy Departments
export const departments: Department[] = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Marketing" },
  { id: "3", name: "Finance" },
  { id: "4", name: "Human Resources" },
  { id: "5", name: "Operations" },
];

// Dummy Holidays
export const holidays: Holiday[] = [
  { id: "1", name: "New Year's Day", date: "2024-01-01" },
  { id: "2", name: "Heroes' Day", date: "2024-02-01" },
  { id: "3", name: "International Women's Day", date: "2024-03-08" },
  { id: "4", name: "Easter Monday", date: "2024-04-01" },
  { id: "5", name: "Labor Day", date: "2024-05-01" },
  { id: "6", name: "Liberation Day", date: "2024-07-04" },
  { id: "7", name: "Umuganura Day", date: "2024-08-02" },
  { id: "8", name: "Christmas Day", date: "2024-12-25" },
];

// Current logged in user
export const currentUser = users[0];
