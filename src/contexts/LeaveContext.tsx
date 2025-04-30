
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  leaveRequests as initialLeaveRequests, 
  users as initialUsers,
  departments as initialDepartments,
  holidays as initialHolidays,
  LeaveRequest,
  User,
  Department,
  Holiday,
  LeaveType,
  LeaveStatus
} from "@/data/dummyData";
import { useToast } from "@/hooks/use-toast";

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  users: User[];
  departments: Department[];
  holidays: Holiday[];
  loadingLeaves: boolean;
  getUserLeaveRequests: (userId: string) => LeaveRequest[];
  getActiveLeaves: () => LeaveRequest[];
  submitLeaveRequest: (leaveRequest: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  updateLeaveRequestStatus: (id: string, status: LeaveStatus, comments?: string) => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

const LeaveContext = createContext<LeaveContextType>({
  leaveRequests: [],
  users: [],
  departments: [],
  holidays: [],
  loadingLeaves: true,
  getUserLeaveRequests: () => [],
  getActiveLeaves: () => [],
  submitLeaveRequest: async () => {},
  updateLeaveRequestStatus: async () => {},
  getUserById: () => undefined,
});

export const useLeave = () => useContext(LeaveContext);

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [users] = useState<User[]>(initialUsers);
  const [departments] = useState<Department[]>(initialDepartments);
  const [holidays] = useState<Holiday[]>(initialHolidays);
  const [loadingLeaves, setLoadingLeaves] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading data from API
    const timer = setTimeout(() => {
      setLoadingLeaves(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getUserLeaveRequests = (userId: string): LeaveRequest[] => {
    return leaveRequests.filter(request => request.userId === userId);
  };

  const getActiveLeaves = (): LeaveRequest[] => {
    const today = new Date().toISOString().split('T')[0];
    return leaveRequests.filter(
      request => 
        request.status === 'Approved' && 
        request.startDate <= today && 
        request.endDate >= today
    );
  };

  const submitLeaveRequest = async (leaveRequest: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRequest: LeaveRequest = {
      ...leaveRequest,
      id: `${leaveRequests.length + 1}`,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    
    setLeaveRequests(prev => [...prev, newRequest]);
    
    toast({
      title: "Leave request submitted",
      description: "Your leave request has been submitted for approval.",
    });
  };

  const updateLeaveRequestStatus = async (id: string, status: LeaveStatus, comments?: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLeaveRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { 
              ...request, 
              status, 
              approvedRejectedAt: new Date().toISOString().split('T')[0],
              approvedRejectedBy: "3", // Assuming admin id for now
              comments: comments || request.comments
            } 
          : request
      )
    );
    
    toast({
      title: `Leave request ${status.toLowerCase()}`,
      description: `The leave request has been ${status.toLowerCase()}.`,
    });
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  return (
    <LeaveContext.Provider value={{ 
      leaveRequests, 
      users, 
      departments,
      holidays,
      loadingLeaves, 
      getUserLeaveRequests, 
      getActiveLeaves,
      submitLeaveRequest, 
      updateLeaveRequestStatus,
      getUserById
    }}>
      {children}
    </LeaveContext.Provider>
  );
};
