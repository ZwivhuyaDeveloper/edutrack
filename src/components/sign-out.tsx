"use client";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

const SignOut = () => {
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex justify-center">
      <Button variant="destructive" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
};

export { SignOut };
