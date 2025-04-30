
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Download, Plus, FileEdit } from "lucide-react";
import { LeaveType } from "@/data/dummyData";

type AdjustmentType = "add" | "subtract" | "set";

const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const { users, departments } = useLeave();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  // Only managers and admins can access this page
  if (!user || (user.role !== "Manager" && user.role !== "Admin")) {
    return (
      <div className="flex justify-center items-center h-96">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
      </div>
    );
  }
  
  // Filter users based on role and search term
  const filteredUsers = users
    .filter(u => user.role === "Admin" || (user.role === "Manager" && u.department === user.department))
    .filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(u => selectedDepartment === "all" || u.department === selectedDepartment);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          {user.role === "Admin" && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {user.role === "Admin" 
              ? "Manage all employees in the organization" 
              : `Manage employees in the ${user.department} department`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {user.role === "Admin" && (
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">PTO</TableHead>
                  <TableHead className="text-center">Sick</TableHead>
                  <TableHead className="text-center">Compassionate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                          <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.role}</Badge>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="text-center">
                      {employee.leaveBalances.PTO}
                    </TableCell>
                    <TableCell className="text-center">
                      {employee.leaveBalances.Sick}
                    </TableCell>
                    <TableCell className="text-center">
                      {employee.leaveBalances.Compassionate}
                    </TableCell>
                    <TableCell className="text-right">
                      <LeaveBalanceDialog employee={employee} />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No employees found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Leave Balance Adjustment Dialog
const LeaveBalanceDialog: React.FC<{ employee: any }> = ({ employee }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("PTO");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("add");
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  
  const availableTypes = Object.keys(employee.leaveBalances) as LeaveType[];
  
  const handleAdjustmentTypeChange = (value: string) => {
    setAdjustmentType(value as AdjustmentType);
  };
  
  const handleSubmit = () => {
    // In a real app, this would call an API to update the leave balance
    console.log(`Adjusting ${leaveType} balance for ${employee.name}:`, {
      type: adjustmentType,
      value: adjustmentValue,
      reason
    });
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <FileEdit className="h-4 w-4" />
          <span className="sr-only">Adjust leave balance</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Leave Balance</DialogTitle>
          <DialogDescription>
            Adjust leave balance for {employee.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Leave Type</label>
            <Select value={leaveType} onValueChange={setLeaveType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current balance: {employee.leaveBalances[leaveType]} days
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Adjustment Type</label>
            <Select value={adjustmentType} onValueChange={handleAdjustmentTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Days</SelectItem>
                <SelectItem value="subtract">Subtract Days</SelectItem>
                <SelectItem value="set">Set to Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Value</label>
            <Input 
              type="number" 
              step="0.5"
              min="0" 
              value={adjustmentValue}
              onChange={(e) => setAdjustmentValue(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {adjustmentType === "add" && `New balance will be ${employee.leaveBalances[leaveType] + adjustmentValue} days`}
              {adjustmentType === "subtract" && `New balance will be ${Math.max(0, employee.leaveBalances[leaveType] - adjustmentValue)} days`}
              {adjustmentType === "set" && `Balance will be set to ${adjustmentValue} days`}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Input 
              placeholder="Reason for adjustment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamManagement;
