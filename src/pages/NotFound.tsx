
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="text-6xl font-bold">404</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn't find the page you're looking for: {location.pathname}
        </p>
        <Button asChild size="lg">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
