import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
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

      // Insertar usuario en tabla
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

  // VALIDAR NOMBRE
  const handleNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;

    if (!regex.test(value)) return;

    setName(value);

    if (value.length === 100) {
      setNameMessage("Has llegado al límite de 100 caracteres.");
    } else if (value.length > 0 && value.length < 2) {
      setNameMessage("El nombre debe tener al menos 2 letras.");
    } else {
      setNameMessage("");
    }
  };

  // VALIDAR EMAIL
  // VALIDAR EMAIL (sin caracteres especiales y más reglas fuertes)
  const handleEmailChange = (e) => {
    let value = e.target.value;

    // Permitir solo letras, números, @, ., _
    value = value.replace(/[^a-zA-Z0-9@._]/g, "");

    // Máximo 255
    if (value.length > 255) return;

    setEmail(value);

    // REGLAS ADICIONALES
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

    // REGEX FINAL (permitiendo solo lo que especificamos)
    const emailRegex =
      /^[A-Za-z0-9._]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (value.length === 255) {
      setEmailMessage("Has llegado al límite de 255 caracteres.");
    } else if (value.length > 0 && !emailRegex.test(value)) {
      setEmailMessage("Formato inválido. Ejemplo: usuario@correo.com");
    } else {
      setEmailMessage("");
    }
  };


  // VALIDAR CONTRASEÑA
  const handlePasswordChange = (e) => {
    const value = e.target.value;

    if (value.length > 255) return;

    setPassword(value);

    if (value.length === 255) {
      setPasswordMessage("Has llegado al límite de 255 caracteres.");
    } else if (value.length > 0 && value.length < 8) {
      setPasswordMessage("La contraseña debe tener al menos 8 caracteres.");
    } else {
      setPasswordMessage("");
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

          {/* NOMBRE */}
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
            {nameMessage && <p className="text-sm text-red-500 mt-1">{nameMessage}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="usuario@correo.com"
              value={email}
              maxLength={255}
              onChange={handleEmailChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {emailMessage && <p className="text-sm text-red-500 mt-1">{emailMessage}</p>}
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              maxLength={255}
              onChange={handlePasswordChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
            {passwordMessage && <p className="text-sm text-red-500 mt-1">{passwordMessage}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            nameMessage !== "" ||
            emailMessage !== "" ||
            passwordMessage !== ""
          }
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
