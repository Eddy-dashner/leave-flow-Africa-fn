
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { differenceInDays, format, isBefore, isAfter, isSameDay } from "date-fns";
import { LeaveRequest } from "@/data/dummyData";

const LeaveBalanceCard: React.FC<{ leaveType: string; balance: number; total: number; color: string }> = ({ 
  leaveType, 
  balance, 
  total,
  color
}) => {
  const percentage = (balance / total) * 100;
  
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{leaveType}</span>
        <span className="text-sm">
          {balance} / {total} days
        </span>
      </div>
      <Progress value={percentage} className={`h-2 ${color}`} />
    </div>
  );
};

const LeaveRequestItem: React.FC<{ request: LeaveRequest }> = ({ request }) => {
  const { getUserById } = useLeave();
  const user = getUserById(request.userId);
  const durationDays = differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1;
  
  const getStatusColor = () => {
    switch (request.status) {
      case "Approved": return "bg-leave-approved text-white";
      case "Rejected": return "bg-leave-rejected text-white";
      default: return "bg-leave-pending text-white";
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 border-b last:border-b-0">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatarUrl} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(request.startDate), "MMM dd")}
            {!isSameDay(new Date(request.startDate), new Date(request.endDate)) && 
              ` - ${format(new Date(request.endDate), "MMM dd")}`}
            {" • "}
            {durationDays} {durationDays === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">{request.leaveType}</Badge>
        <Badge className={`text-xs ${getStatusColor()}`}>{request.status}</Badge>
      </div>
    </div>
  );
};

const TeamOnLeaveCard: React.FC = () => {
  const { leaveRequests, users } = useLeave();
  const today = new Date();
  
  // Get users currently on leave
  const usersOnLeave = leaveRequests
    .filter(request => 
      request.status === "Approved" && 
      (isBefore(today, new Date(request.endDate)) || isSameDay(today, new Date(request.endDate))) && 
      (isAfter(today, new Date(request.startDate)) || isSameDay(today, new Date(request.startDate)))
    )
    .map(request => {
      const user = users.find(u => u.id === request.userId);
      return {
        ...user,
        endDate: request.endDate,
        leaveType: request.leaveType
      };
    });
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Team on Leave</CardTitle>
        <CardDescription>Colleagues currently on leave</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        {usersOnLeave.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No team members currently on leave
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {usersOnLeave.map(user => (
              <TooltipProvider key={user?.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center justify-center">
                      <Avatar className="h-16 w-16 mb-2">
                        <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-center line-clamp-1">{user?.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user?.name}</p>
                    <p className="text-xs">{user?.leaveType} leave</p>
                    <p className="text-xs">Until {format(new Date(user?.endDate || ""), "PPP")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CalendarCard: React.FC = () => {
  const { leaveRequests, holidays } = useLeave();
  const { user } = useAuth();
  
  const today = new Date();
  const [date, setDate] = React.useState<Date | undefined>(today);
  
  // Get all approved leaves
  const approvedLeaves = leaveRequests.filter(request => request.status === "Approved");
  
  // Function to determine if a day has a specific leave type
  const getDayLeaveType = (day: Date) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    
    // Check if it's a holiday
    const isHoliday = holidays.some(holiday => holiday.date === formattedDay);
    if (isHoliday) return "public";
    
    // Check user's leaves
    if (user) {
      const userLeave = approvedLeaves.find(leave => 
        leave.userId === user.id && 
        formattedDay >= leave.startDate && 
        formattedDay <= leave.endDate
      );
      
      if (userLeave) {
        return userLeave.leaveType.toLowerCase();
      }
    }
    
    return null;
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leave Calendar</CardTitle>
        <CardDescription>Your upcoming leaves and holidays</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            pto: (day) => getDayLeaveType(day) === "pto",
            sick: (day) => getDayLeaveType(day) === "sick",
            compassionate: (day) => getDayLeaveType(day) === "compassionate",
            maternity: (day) => getDayLeaveType(day) === "maternity",
            public: (day) => getDayLeaveType(day) === "public",
          }}
          modifiersClassNames={{
            pto: "calendar-day-pto",
            sick: "calendar-day-sick",
            compassionate: "calendar-day-compassionate",
            maternity: "calendar-day-maternity",
            public: "calendar-day-public",
          }}
        />
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-leave-pto"></span>
            <span className="text-xs">PTO</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-leave-sick"></span>
            <span className="text-xs">Sick</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-leave-compassionate"></span>
            <span className="text-xs">Compassionate</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-leave-maternity"></span>
            <span className="text-xs">Maternity</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-leave-public"></span>
            <span className="text-xs">Holiday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getUserLeaveRequests, loadingLeaves } = useLeave();
  
  if (!user) return null;
  
  const userLeaveRequests = getUserLeaveRequests(user.id);
  const pendingRequests = userLeaveRequests.filter(request => request.status === "Pending");
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/apply">Apply for Leave</Link>
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="col-span-full lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Leave Balance</CardTitle>
              <CardDescription>
                Monthly accrual: 1.66 days PTO per month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LeaveBalanceCard 
                leaveType="Personal Time Off (PTO)" 
                balance={user.leaveBalances.PTO} 
                total={20} 
                color="bg-leave-pto text-white"
              />
              <LeaveBalanceCard 
                leaveType="Sick Leave" 
                balance={user.leaveBalances.Sick} 
                total={10} 
                color="bg-leave-sick text-white"
              />
              <LeaveBalanceCard 
                leaveType="Compassionate Leave" 
                balance={user.leaveBalances.Compassionate} 
                total={5} 
                color="bg-leave-compassionate text-white"
              />
              <LeaveBalanceCard 
                leaveType="Maternity Leave" 
                balance={user.leaveBalances.Maternity} 
                total={90} 
                color="bg-leave-maternity text-white"
              />
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Maximum 5 days of PTO can be carried over to the next year. Excess days will expire by Jan 31st.
              </p>
            </CardFooter>
          </Card>
          
          <Card className="col-span-full lg:col-span-1">
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLeaves ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending requests
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pendingRequests.map(request => (
                        <LeaveRequestItem key={request.id} request={request} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamOnLeaveCard />
          <CalendarCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
