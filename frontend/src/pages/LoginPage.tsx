import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("Student");
  const [password, setPassword] = useState("parola123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      setToken(res.access_token);
      navigate("/avatars");
    } catch {
      setError("Login eșuat. Verifică username/parola.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ width: 430,height:250, marginTop: 92 }}>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Autentificare</h2>
      <p style={{ marginTop: 0, marginBottom: 16, fontSize: 13, color: "#9ca3af" }}>
        Intră în aplicație și alege-ți avatarul tutorului tău AI.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div>
          <label style={{ fontSize: 13 }}>Username</label>
          <input
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label style={{ fontSize: 13 }}>Parola</label>
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p style={{ color: "#f97373", fontSize: 13, marginTop: 4 }}>{error}</p>
        )}
        <button className="button-primary" type="submit" disabled={loading}>
          {loading ? "Se autentifică..." : "Intră în aplicație"}
        </button>
      </form>
    </div>
  );
}
