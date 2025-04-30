
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save } from "lucide-react";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { departments, holidays } = useLeave();
  const { toast } = useToast();
  
  // Only admin can access this page
  if (!user || user.role !== "Admin") {
    return (
      <div className="flex justify-center items-center h-96">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
      </div>
    );
  }
  
  const handleSaveChanges = () => {
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully",
    });
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Tabs defaultValue="leave-types">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leave-types" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Type Settings</CardTitle>
              <CardDescription>
                Configure leave types, accrual rates, and carryover policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveTypeSettings />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="holidays" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Public Holidays</CardTitle>
              <CardDescription>
                Manage public holidays for the calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HolidaySettings holidays={holidays} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Management</CardTitle>
              <CardDescription>
                Manage departments in the organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentSettings departments={departments} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Leave Type Settings Component
const LeaveTypeSettings: React.FC = () => {
  const leaveTypes = [
    {
      id: "1",
      name: "PTO",
      displayName: "Personal Time Off",
      defaultBalance: 20,
      accrualRate: 1.66,
      accrualPeriod: "Monthly",
      carryOver: 5,
      requiresApproval: true,
      requiresDocumentation: false,
    },
    {
      id: "2",
      name: "Sick",
      displayName: "Sick Leave",
      defaultBalance: 10,
      accrualRate: 0.83,
      accrualPeriod: "Monthly",
      carryOver: 0,
      requiresApproval: true,
      requiresDocumentation: true,
    },
    {
      id: "3",
      name: "Compassionate",
      displayName: "Compassionate Leave",
      defaultBalance: 5,
      accrualRate: 0,
      accrualPeriod: "None",
      carryOver: 0,
      requiresApproval: true,
      requiresDocumentation: true,
    },
    {
      id: "4",
      name: "Maternity",
      displayName: "Maternity Leave",
      defaultBalance: 90,
      accrualRate: 0,
      accrualPeriod: "None",
      carryOver: 0,
      requiresApproval: true,
      requiresDocumentation: true,
    },
    {
      id: "5",
      name: "Unpaid",
      displayName: "Unpaid Leave",
      defaultBalance: 0,
      accrualRate: 0,
      accrualPeriod: "None",
      carryOver: 0,
      requiresApproval: true,
      requiresDocumentation: false,
    },
  ];
  
  const [editedTypes, setEditedTypes] = useState(leaveTypes);
  const [newType, setNewType] = useState({
    id: "",
    name: "",
    displayName: "",
    defaultBalance: 0,
    accrualRate: 0,
    accrualPeriod: "None",
    carryOver: 0,
    requiresApproval: true,
    requiresDocumentation: false,
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const handleInputChange = (id: string, field: string, value: any) => {
    setEditedTypes(prev => 
      prev.map(type => 
        type.id === id ? { ...type, [field]: value } : type
      )
    );
  };
  
  const handleNewTypeChange = (field: string, value: any) => {
    setNewType(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddNewType = () => {
    if (newType.name && newType.displayName) {
      setEditedTypes(prev => [
        ...prev, 
        { 
          ...newType, 
          id: `${prev.length + 1}`
        }
      ]);
      setNewType({
        id: "",
        name: "",
        displayName: "",
        defaultBalance: 0,
        accrualRate: 0,
        accrualPeriod: "None",
        carryOver: 0,
        requiresApproval: true,
        requiresDocumentation: false,
      });
      setIsAddingNew(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leave Type</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Default Balance</TableHead>
            <TableHead>Accrual Rate</TableHead>
            <TableHead>Carry Over</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editedTypes.map((type) => (
            <TableRow key={type.id}>
              <TableCell>
                <Input 
                  value={type.name} 
                  onChange={(e) => handleInputChange(type.id, "name", e.target.value)} 
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={type.displayName} 
                  onChange={(e) => handleInputChange(type.id, "displayName", e.target.value)} 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={type.defaultBalance} 
                  onChange={(e) => handleInputChange(type.id, "defaultBalance", Number(e.target.value))} 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={type.accrualRate} 
                  onChange={(e) => handleInputChange(type.id, "accrualRate", Number(e.target.value))} 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={type.carryOver} 
                  onChange={(e) => handleInputChange(type.id, "carryOver", Number(e.target.value))} 
                />
              </TableCell>
            </TableRow>
          ))}
          
          {isAddingNew && (
            <TableRow>
              <TableCell>
                <Input 
                  value={newType.name} 
                  onChange={(e) => handleNewTypeChange("name", e.target.value)} 
                  placeholder="Type code"
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={newType.displayName} 
                  onChange={(e) => handleNewTypeChange("displayName", e.target.value)} 
                  placeholder="Display name"
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={newType.defaultBalance} 
                  onChange={(e) => handleNewTypeChange("defaultBalance", Number(e.target.value))} 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={newType.accrualRate} 
                  onChange={(e) => handleNewTypeChange("accrualRate", Number(e.target.value))} 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={newType.carryOver} 
                  onChange={(e) => handleNewTypeChange("carryOver", Number(e.target.value))} 
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex justify-between">
        {!isAddingNew ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Leave Type
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              size="sm" 
              onClick={handleAddNewType}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingNew(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

// Holiday Settings Component
const HolidaySettings: React.FC<{ holidays: any[] }> = ({ holidays }) => {
  const [editedHolidays, setEditedHolidays] = useState(holidays);
  const [newHoliday, setNewHoliday] = useState({
    id: "",
    name: "",
    date: "",
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const handleInputChange = (id: string, field: string, value: any) => {
    setEditedHolidays(prev => 
      prev.map(holiday => 
        holiday.id === id ? { ...holiday, [field]: value } : holiday
      )
    );
  };
  
  const handleNewHolidayChange = (field: string, value: any) => {
    setNewHoliday(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddNewHoliday = () => {
    if (newHoliday.name && newHoliday.date) {
      setEditedHolidays(prev => [
        ...prev, 
        { 
          ...newHoliday, 
          id: `${prev.length + 1}`
        }
      ]);
      setNewHoliday({
        id: "",
        name: "",
        date: "",
      });
      setIsAddingNew(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Holiday Name</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editedHolidays.map((holiday) => (
            <TableRow key={holiday.id}>
              <TableCell>
                <Input 
                  value={holiday.name} 
                  onChange={(e) => handleInputChange(holiday.id, "name", e.target.value)} 
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="date" 
                  value={holiday.date} 
                  onChange={(e) => handleInputChange(holiday.id, "date", e.target.value)} 
                />
              </TableCell>
            </TableRow>
          ))}
          
          {isAddingNew && (
            <TableRow>
              <TableCell>
                <Input 
                  value={newHoliday.name} 
                  onChange={(e) => handleNewHolidayChange("name", e.target.value)} 
                  placeholder="Holiday name"
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="date" 
                  value={newHoliday.date} 
                  onChange={(e) => handleNewHolidayChange("date", e.target.value)} 
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex justify-between">
        {!isAddingNew ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Holiday
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              size="sm" 
              onClick={handleAddNewHoliday}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingNew(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

// Department Settings Component
const DepartmentSettings: React.FC<{ departments: any[] }> = ({ departments }) => {
  const [editedDepartments, setEditedDepartments] = useState(departments);
  const [newDepartment, setNewDepartment] = useState({
    id: "",
    name: "",
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const handleInputChange = (id: string, field: string, value: any) => {
    setEditedDepartments(prev => 
      prev.map(dept => 
        dept.id === id ? { ...dept, [field]: value } : dept
      )
    );
  };
  
  const handleNewDepartmentChange = (field: string, value: any) => {
    setNewDepartment(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddNewDepartment = () => {
    if (newDepartment.name) {
      setEditedDepartments(prev => [
        ...prev, 
        { 
          ...newDepartment, 
          id: `${prev.length + 1}`
        }
      ]);
      setNewDepartment({
        id: "",
        name: "",
      });
      setIsAddingNew(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {editedDepartments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell>
                <Input 
                  value={dept.name} 
                  onChange={(e) => handleInputChange(dept.id, "name", e.target.value)} 
                />
              </TableCell>
            </TableRow>
          ))}
          
          {isAddingNew && (
            <TableRow>
              <TableCell>
                <Input 
                  value={newDepartment.name} 
                  onChange={(e) => handleNewDepartmentChange("name", e.target.value)} 
                  placeholder="Department name"
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <div className="flex justify-between">
        {!isAddingNew ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              size="sm" 
              onClick={handleAddNewDepartment}
            >
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingNew(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
