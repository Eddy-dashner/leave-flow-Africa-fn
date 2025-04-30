
import React, { useState } from "react";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { addMonths, format, isSameMonth, isSameDay, parseISO } from "date-fns";

const TeamCalendar: React.FC = () => {
  const { leaveRequests, users, departments, holidays } = useLeave();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  // Filter approved leave requests
  const approvedLeaves = leaveRequests.filter(request => request.status === "Approved");
  
  // Filter users by department if selected
  const filteredUsers = selectedDepartment === "all" 
    ? users 
    : users.filter(user => user.department === selectedDepartment);
  
  // Get users on leave for a specific day
  const getUsersOnLeave = (day: Date) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    
    return approvedLeaves
      .filter(leave => {
        return leave.startDate <= formattedDay && leave.endDate >= formattedDay;
      })
      .map(leave => {
        const user = users.find(u => u.id === leave.userId);
        if (user && (selectedDepartment === "all" || user.department === selectedDepartment)) {
          return {
            ...user,
            leaveType: leave.leaveType
          };
        }
        return null;
      })
      .filter(Boolean);
  };
  
  // Get all days with leaves in the selected month
  const getDaysWithLeaves = () => {
    const daysWithLeaves: Record<string, any[]> = {};
    
    if (date) {
      // Get the first and last day of the month
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Format dates for comparison
      const firstDayStr = format(firstDay, "yyyy-MM-dd");
      const lastDayStr = format(lastDay, "yyyy-MM-dd");
      
      // Find leave requests that overlap with the selected month
      approvedLeaves.forEach(leave => {
        if (leave.endDate >= firstDayStr && leave.startDate <= lastDayStr) {
          const user = filteredUsers.find(u => u.id === leave.userId);
          if (user) {
            // Get all days in the leave period that fall within the month
            let currentDate = new Date(
              Math.max(
                new Date(leave.startDate).getTime(),
                firstDay.getTime()
              )
            );
            const endDate = new Date(
              Math.min(
                new Date(leave.endDate).getTime(),
                lastDay.getTime()
              )
            );
            
            while (currentDate <= endDate) {
              const dateStr = format(currentDate, "yyyy-MM-dd");
              if (!daysWithLeaves[dateStr]) {
                daysWithLeaves[dateStr] = [];
              }
              daysWithLeaves[dateStr].push({
                userId: leave.userId,
                userName: user.name,
                userAvatar: user.avatarUrl,
                leaveType: leave.leaveType
              });
              currentDate = addMonths(currentDate, 0);
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        }
      });
      
      // Add public holidays
      holidays.forEach(holiday => {
        const holidayDate = new Date(holiday.date);
        if (isSameMonth(holidayDate, date)) {
          const dateStr = format(holidayDate, "yyyy-MM-dd");
          if (!daysWithLeaves[dateStr]) {
            daysWithLeaves[dateStr] = [];
          }
          daysWithLeaves[dateStr].push({
            isHoliday: true,
            name: holiday.name
          });
        }
      });
    }
    
    return daysWithLeaves;
  };
  
  const daysWithLeaves = getDaysWithLeaves();
  
  // Function to determine classes for calendar days
  const getDayClass = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayLeaves = daysWithLeaves[dateStr] || [];
    
    if (dayLeaves.length === 0) return "";
    
    if (dayLeaves.some(leave => leave.isHoliday)) return "calendar-day-public";
    
    const leaveTypes = new Set(dayLeaves.map(leave => leave.leaveType?.toLowerCase()));
    
    if (leaveTypes.has("pto")) return "calendar-day-pto";
    if (leaveTypes.has("sick")) return "calendar-day-sick";
    if (leaveTypes.has("compassionate")) return "calendar-day-compassionate";
    if (leaveTypes.has("maternity")) return "calendar-day-maternity";
    
    return "";
  };
  
  // Function to get details for a selected day
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const selectedDayStr = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";
  const selectedDayLeaves = selectedDayStr ? daysWithLeaves[selectedDayStr] || [] : [];
  const holidaysForSelectedDay = holidays.filter(
    holiday => selectedDayStr === holiday.date
  );
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Leave Calendar</CardTitle>
                <CardDescription>Team leave schedule and holidays</CardDescription>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={setSelectedDay}
              month={date}
              onMonthChange={setDate}
              className="rounded-md border"
              classNames={{
                day_today: "bg-muted text-foreground",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
              modifiersClassNames={{
                ...Object.fromEntries(
                  Object.entries(daysWithLeaves).map(([key, leaves]) => {
                    const day = parseISO(key);
                    const className = getDayClass(day);
                    return [key, className];
                  })
                )
              }}
            />
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
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
        
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDay ? format(selectedDay, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
            <CardDescription>
              {selectedDay ? `Leaves and events for ${format(selectedDay, "EEEE")}` : "Click on a date to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {holidaysForSelectedDay.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Public Holiday</h3>
                {holidaysForSelectedDay.map(holiday => (
                  <div 
                    key={holiday.id}
                    className="flex items-center gap-2 py-2 px-3 rounded-md bg-leave-public/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-leave-public"></div>
                    <span>{holiday.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <h3 className="text-sm font-medium mb-2">Team Members on Leave</h3>
            {selectedDayLeaves.filter(leave => !leave.isHoliday).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No team members on leave
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayLeaves
                  .filter(leave => !leave.isHoliday)
                  .map((leave, index) => {
                    const user = users.find(u => u.id === leave.userId);
                    
                    if (!user) return null;
                    
                    let leaveColor;
                    switch (leave.leaveType?.toLowerCase()) {
                      case "pto": leaveColor = "bg-leave-pto"; break;
                      case "sick": leaveColor = "bg-leave-sick"; break;
                      case "compassionate": leaveColor = "bg-leave-compassionate"; break;
                      case "maternity": leaveColor = "bg-leave-maternity"; break;
                      default: leaveColor = "bg-gray-300";
                    }
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={leave.userAvatar} alt={leave.userName} />
                            <AvatarFallback>{leave.userName?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{leave.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.department}
                            </p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={leaveColor}>{leave.leaveType}</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{leave.leaveType} Leave</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamCalendar;
