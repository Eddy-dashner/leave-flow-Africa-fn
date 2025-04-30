
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { LeaveStatus } from "@/data/dummyData";

const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const { leaveRequests, getUserById, updateLeaveRequestStatus } = useLeave();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [statusAction, setStatusAction] = useState<{ id: string; status: LeaveStatus }>({ id: "", status: "Pending" });
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  if (!user) return null;
  
  // Get requests based on user role
  const filteredRequests = user.role === "Staff"
    ? leaveRequests.filter(request => request.userId === user.id)
    : leaveRequests;
  
  // Further filter based on selected tab
  const displayedRequests = selectedTab === "all"
    ? filteredRequests
    : filteredRequests.filter(request => request.status.toLowerCase() === selectedTab);
  
  const handleStatusChange = async (id: string, status: LeaveStatus) => {
    setStatusAction({ id, status });
  };
  
  const confirmStatusChange = async () => {
    if (!statusAction.id) return;
    
    setIsLoading(true);
    try {
      await updateLeaveRequestStatus(statusAction.id, statusAction.status, comments);
      setComments("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-leave-approved text-white";
      case "Rejected": return "bg-leave-rejected text-white";
      default: return "bg-leave-pending text-white";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        <Button asChild>
          <Link to="/apply">Apply for Leave</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {user.role === "Staff" ? "Your Leave Requests" : "Team Leave Requests"}
          </CardTitle>
          <CardDescription>
            {user.role === "Staff" 
              ? "View and manage your leave requests" 
              : "Approve or reject leave requests from your team"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {displayedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leave requests found
                </div>
              ) : (
                displayedRequests.map(request => {
                  const requestUser = getUserById(request.userId);
                  return (
                    <div 
                      key={request.id}
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={requestUser?.avatarUrl} alt={requestUser?.name} />
                            <AvatarFallback>{requestUser?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{requestUser?.name}</p>
                            <p className="text-sm text-muted-foreground">{requestUser?.department}</p>
                          </div>
                        </div>
                        
                        <Badge className={getStatusBadgeColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Leave Type</p>
                          <p>{request.leaveType}</p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Duration</p>
                          <p>
                            {format(new Date(request.startDate), "MMM dd, yyyy")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium">Submitted On</p>
                          <p>{format(new Date(request.submittedAt), "MMM dd, yyyy")}</p>
                        </div>
                      </div>
                      
                      {request.reason && (
                        <div className="mt-4 text-sm">
                          <p className="font-medium">Reason</p>
                          <p className="mt-1">{request.reason}</p>
                        </div>
                      )}
                      
                      {request.attachmentUrl && (
                        <div className="mt-4 text-sm">
                          <p className="font-medium">Attachment</p>
                          <a 
                            href="#" 
                            className="text-primary hover:underline mt-1 inline-block"
                            onClick={(e) => e.preventDefault()}
                          >
                            {request.attachmentUrl}
                          </a>
                        </div>
                      )}
                      
                      {request.comments && (
                        <div className="mt-4 text-sm">
                          <p className="font-medium">Comments</p>
                          <p className="mt-1">{request.comments}</p>
                        </div>
                      )}
                      
                      {(user.role === "Manager" || user.role === "Admin") && request.status === "Pending" && (
                        <div className="flex flex-wrap gap-2 mt-4 justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(request.id, "Rejected")}
                              >
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Leave Request</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to reject this leave request? Please provide a reason.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Textarea
                                  placeholder="Enter reason for rejection"
                                  value={comments}
                                  onChange={(e) => setComments(e.target.value)}
                                />
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button 
                                    variant="destructive" 
                                    onClick={confirmStatusChange}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? "Rejecting..." : "Reject Request"}
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                onClick={() => handleStatusChange(request.id, "Approved")}
                              >
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve Leave Request</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to approve this leave request?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Textarea
                                  placeholder="Optional comments"
                                  value={comments}
                                  onChange={(e) => setComments(e.target.value)}
                                />
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button 
                                    onClick={confirmStatusChange}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? "Approving..." : "Approve Request"}
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {/* Display pending requests - Same structure as above */}
              {displayedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                // Would render same content as "all" tab but filtered by pending status
                <div className="py-8 text-center">Showing {displayedRequests.length} pending requests</div>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {/* Display approved requests - Same structure as above */}
              {displayedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No approved requests
                </div>
              ) : (
                // Would render same content as "all" tab but filtered by approved status
                <div className="py-8 text-center">Showing {displayedRequests.length} approved requests</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveRequests;
