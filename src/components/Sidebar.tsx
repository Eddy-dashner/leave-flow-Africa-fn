
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Home, Users, Settings, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-secondary"
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen w-64 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">AfricaHR</h1>
        <p className="text-sm text-muted-foreground">Leave Flow</p>
      </div>
      
      <div className="flex-1 py-4 px-2 space-y-1 overflow-auto">
        <SidebarLink
          to="/"
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          active={isActive("/")}
        />
        
        <SidebarLink
          to="/leave-requests"
          icon={<FileText className="h-5 w-5" />}
          label="Leave Requests"
          active={isActive("/leave-requests")}
        />
        
        <SidebarLink
          to="/calendar"
          icon={<Calendar className="h-5 w-5" />}
          label="Team Calendar"
          active={isActive("/calendar")}
        />
        
        {(user.role === "Manager" || user.role === "Admin") && (
          <SidebarLink
            to="/team"
            icon={<Users className="h-5 w-5" />}
            label="Team Management"
            active={isActive("/team")}
          />
        )}
        
        {user.role === "Admin" && (
          <SidebarLink
            to="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            active={isActive("/settings")}
          />
        )}
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => logout()} 
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  );
};
