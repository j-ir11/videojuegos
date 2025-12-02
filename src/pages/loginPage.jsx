import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
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
      navigate("/");
    }
  };

  const handleGoBack = () => {
    if (location.state?.fromRegister) {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  // VALIDACIÓN DE EMAIL IGUAL QUE EN REGISTRO
  const handleEmailChange = (e) => {
    let value = e.target.value;

    // Permitir solo letras, números, ., _, @
    value = value.replace(/[^a-zA-Z0-9@._]/g, "");

    if (value.length > 255) return;

    setEmail(value);

    // REGLAS EXTRA
    if (value.startsWith(".") || value.startsWith("_") || value.startsWith("-")) {
      setEmailMessage("El correo no puede iniciar con un punto o símbolo.");
      return;
    }

    if (value.endsWith(".")) {
      setEmailMessage("El correo no puede terminar con un punto.");
      return;
    }

    if ((value.match(/@/g) || []).length > 1) {
      setEmailMessage("El correo no puede tener más de un '@'.");
      return;
    }

    if (value.includes("..")) {
      setEmailMessage("El correo no puede contener '..'.");
      return;
    }

    // REGEX FINAL
    const emailRegex = /^[A-Za-z0-9._]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (value.length === 255) {
      setEmailMessage("Has llegado al límite de 255 caracteres.");
    } else if (value.length > 0 && !emailRegex.test(value)) {
      setEmailMessage("Formato inválido. Ejemplo: usuario@correo.com");
    } else {
      setEmailMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Iniciar Sesión</h2>

        {error && <p className="text-red-500">{error}</p>}
        {message && <p className="text-yellow-600 mb-4">{message}</p>}

        {/* EMAIL */}
        <div>
          <input
            type="text"
            placeholder="Correo electrónico"
            value={email}
            maxLength={255}
            onChange={handleEmailChange}
            className="w-full border rounded px-4 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
            required
          />
          {emailMessage && <p className="text-sm text-red-500 mt-1">{emailMessage}</p>}
        </div>

        {/* PASSWORD */}
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
          disabled={emailMessage !== ""}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Iniciar sesión
        </button>

        <p className="text-center text-sm text-gray-700 dark:text-gray-300">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline dark:text-blue-400">
            Regístrate
          </Link>
        </p>

        <button
          type="button"
          onClick={handleGoBack}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded mt-4 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          Regresar
        </button>
      </form>
    </div>
  );
}
