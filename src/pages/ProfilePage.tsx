import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate("/");
      else setUser(data.session.user);
    });
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.user_metadata?.full_name && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{user.user_metadata.full_name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Member since</p>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-md transition-colors mt-4"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
