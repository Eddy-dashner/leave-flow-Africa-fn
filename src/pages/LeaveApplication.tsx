
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, differenceInDays, isWeekend } from "date-fns";
import { LeaveType } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

const LeaveApplication: React.FC = () => {
  const { user } = useAuth();
  const { submitLeaveRequest } = useLeave();
  const navigate = useNavigate();
  
  const [leaveType, setLeaveType] = useState<LeaveType>("PTO");
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [reason, setReason] = useState("");
  const [documentRequired, setDocumentRequired] = useState(false);
  const [document, setDocument] = useState<File | null>(null);
  const [isHalfDay, setIsHalfDay] = useState("full");
  const [isLoading, setIsLoading] = useState(false);
  
  if (!user) return null;
  
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    
    let count = 0;
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    while (currentDate <= lastDate) {
      if (!isWeekend(currentDate)) {
        count++;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    if (isHalfDay === "half" && count > 0) {
      count -= 0.5;
    }
    
    return count;
  };
  
  const daysRequested = calculateDays();
  
  const handleLeaveTypeChange = (type: LeaveType) => {
    setLeaveType(type);
    setDocumentRequired(type === "Sick" || type === "Compassionate" || type === "Maternity");
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !user) return;
    
    setIsLoading(true);
    
    try {
      await submitLeaveRequest({
        userId: user.id,
        leaveType,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        reason,
        attachmentUrl: document ? document.name : undefined
      });
      
      navigate("/leave-requests");
    } catch (error) {
      console.error("Failed to submit leave request:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leave Application</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>New Leave Request</CardTitle>
            <CardDescription>
              Submit your leave request for approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Leave Type</Label>
                <RadioGroup 
                  value={leaveType} 
                  onValueChange={(value) => handleLeaveTypeChange(value as LeaveType)} 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
                >
                  <div>
                    <RadioGroupItem 
                      value="PTO" 
                      id="pto" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="pto"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-muted-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="w-6 h-6 rounded-full bg-leave-pto mb-2"></div>
                      <span>PTO</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Balance: {user.leaveBalances.PTO} days
                      </span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="Sick" 
                      id="sick" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="sick"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-muted-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="w-6 h-6 rounded-full bg-leave-sick mb-2"></div>
                      <span>Sick</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Balance: {user.leaveBalances.Sick} days
                      </span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="Compassionate" 
                      id="compassionate" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="compassionate"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-muted-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="w-6 h-6 rounded-full bg-leave-compassionate mb-2"></div>
                      <span>Compassionate</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Balance: {user.leaveBalances.Compassionate} days
                      </span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="Maternity" 
                      id="maternity" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="maternity"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-muted-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="w-6 h-6 rounded-full bg-leave-maternity mb-2"></div>
                      <span>Maternity</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Balance: {user.leaveBalances.Maternity} days
                      </span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="Unpaid" 
                      id="unpaid" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="unpaid"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-muted-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="w-6 h-6 rounded-full bg-gray-300 mb-2"></div>
                      <span>Unpaid</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        No limit
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          if (date && (!endDate || date > endDate)) {
                            setEndDate(date);
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date < (startDate || new Date())}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div>
                <Label>Full Day or Half Day</Label>
                <Select 
                  value={isHalfDay} 
                  onValueChange={setIsHalfDay} 
                  disabled={startDate && endDate ? differenceInDays(endDate, startDate) > 0 : false}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select day type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Day</SelectItem>
                    <SelectItem value="half">Half Day (AM)</SelectItem>
                    <SelectItem value="half-pm">Half Day (PM)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  {daysRequested} working day{daysRequested !== 1 ? 's' : ''} requested
                </p>
              </div>
              
              <div>
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  className="mt-2"
                  placeholder="Please provide details about your leave request"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required={leaveType === "Sick" || leaveType === "Compassionate"}
                />
              </div>
              
              {documentRequired && (
                <div>
                  <Label htmlFor="document">Supporting Document</Label>
                  <div className="mt-2">
                    <Input
                      id="document"
                      type="file"
                      onChange={handleFileChange}
                      required={leaveType === "Sick" || leaveType === "Maternity"}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {leaveType === "Sick" ? "Medical certificate required for sick leave over 2 days" :
                     leaveType === "Maternity" ? "Medical certificate confirming pregnancy is required" :
                     "Supporting documents if applicable"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !startDate || !endDate || daysRequested === 0}
            >
              {isLoading ? "Submitting..." : "Submit Leave Request"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default LeaveApplication;
