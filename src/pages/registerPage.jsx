import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [nameMessage, setNameMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se recibió datos del usuario");

      // Insertar en tabla usuarios
      const { error: insertError } = await supabase
        .from("usuarios")
        .insert([
          {
            id_usuario: authData.user.id,
            nombre: name,
            email: email,
            fecha_registro: new Date().toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      // Confirmación de email
      if (authData.user?.identities?.length === 0) {
        alert("Por favor verifica tu correo electrónico para completar el registro");
      }

      navigate("/");

    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message || "Error durante el registro");
    } finally {
      setLoading(false);
    }
  };

  // Validación SOLO letras + acentos + espacios
  const handleNameChange = (e) => {
    const value = e.target.value;

    // Solo letras y espacios (incluye acentos y ñ)
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

    // Si intenta meter símbolos o números, no escribe
    if (!regex.test(value)) {
      return;
    }

    setName(value);

    // Validaciones de mensaje
    if (value.length === 100) {
      setNameMessage("Has llegado al límite de 100 caracteres.");
    } else if (value.length > 0 && value.length < 2) {
      setNameMessage("El nombre debe tener al menos 2 letras.");
    } else {
      setNameMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Registro</h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre completo
            </label>

            <input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              maxLength={100}
              onChange={handleNameChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />

            {nameMessage && (
              <p className="text-sm text-red-500 mt-1">{nameMessage}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              maxLength={255}
              onChange={(e) => {
                if (e.target.value.length <= 255) {
                  setEmail(e.target.value);
                }
              }}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              minLength="6"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || nameMessage !== ""} // Bloquea registro si el nombre es inválido
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </>
          ) : "Registrarse"}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => navigate("/login", { state: { fromRegister: true } })}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </div>
  );
}