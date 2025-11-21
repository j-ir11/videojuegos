import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");  // Para mostrar el mensaje de advertencia
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si hay un mensaje en el estado de la navegación, lo seteamos
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/"); // Redirige al home o a la página anterior
    }
  };

  const handleGoBack = () => {
    if (location.state?.fromRegister) {
      // Si viene del registro, redirige al Home
      navigate("/");
    } else {
      // Si no, regresa a la página anterior
      navigate(-1);
    }
  };

 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Iniciar Sesión</h2>

        {error && <p className="text-red-500">{error}</p>}

        {message && <p className="text-yellow-600 mb-4">{message}</p>}  {/* Mostrar mensaje */}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Iniciar sesión
        </button>

        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          ¿No tienes?{" "}
          <Link to="/register" className="text-blue-600 hover:underline dark:text-blue-400">
            Regístrate
          </Link>
        </p>

        <button
          type="button"
          onClick={handleGoBack}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded mt-4 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500">
          Regresar
        </button>
      </form>
    </div>
  );
}
