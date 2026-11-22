import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { AuthContext } from "./useAuth";

const recoveryKey = "thermapredict-password-recovery";

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(supabase));
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY" && nextSession) {
        sessionStorage.setItem(recoveryKey, nextSession.user.id);
      } else if (event === "SIGNED_OUT") {
        sessionStorage.removeItem(recoveryKey);
      }

      setSession(nextSession);
      setRecovering(Boolean(nextSession && sessionStorage.getItem(recoveryKey) === nextSession.user.id));
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  function completeRecovery() {
    sessionStorage.removeItem(recoveryKey);
    setRecovering(false);
  }

  return (
    <AuthContext.Provider value={{ session, initializing, recovering, completeRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}
