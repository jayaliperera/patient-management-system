import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { api, setAuthToken } from "./api";
import AppLogo from "./components/AppLogo";
import AuthScreen from "./features/auth/AuthScreen";
import PatientDashboard from "./features/patient/PatientDashboard";
import DoctorDashboard from "./features/doctor/DoctorDashboard";

export default function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("pms-session") || "null"));
  const [authChecked, setAuthChecked] = useState(() => !localStorage.getItem("pms-session"));
  const [mode, setMode] = useState("login");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setAuthToken(session?.access_token);
    if (session) localStorage.setItem("pms-session", JSON.stringify(session));
    else localStorage.removeItem("pms-session");
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    async function verifySavedSession() {
      if (!session?.access_token) {
        setAuthChecked(true);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) {
          setSession((current) => current ? { ...current, user: data } : current);
          setAuthChecked(true);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
          setAuthChecked(true);
          notify("Session expired. Please sign in again.");
        }
      }
    }
    verifySavedSession();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401 && session) {
          setSession(null);
          notify("Session expired. Please sign in again.");
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [session]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  const isPatient = session?.user.role === "PATIENT";
  const isDoctor = session?.user.role === "DOCTOR";

  if (!authChecked) {
    return (
      <main className="auth-shell">
        <div className="auth-loading">Checking your session...</div>
      </main>
    );
  }

  return (
    <main className={!session ? "auth-shell" : isPatient ? "patient-app-shell" : isDoctor ? "doctor-app-shell" : "shell"}>
      {(!session || (!isPatient && !isDoctor)) && <header className="topbar">
        <AppLogo className="topbar-logo" />
        {session && (
          <div className="user-strip">
            <span>{session.user.name}</span>
            <button className="icon-button" onClick={() => setSession(null)} aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </header>}

      {toast && <div className="toast">{toast}</div>}

      {!session ? (
        <AuthScreen mode={mode} setMode={setMode} setSession={setSession} notify={notify} />
      ) : session.user.role === "PATIENT" ? (
        <PatientDashboard session={session} setSession={setSession} notify={notify} />
      ) : (
        <DoctorDashboard session={session} setSession={setSession} notify={notify} />
      )}
    </main>
  );
}
