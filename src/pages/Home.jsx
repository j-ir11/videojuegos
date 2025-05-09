import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import ProductCard from "../components/ProductCard";
import { ShoppingCart, LogIn, Search, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // useEffect para obtener el usuario al montar el componente
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        setIsAuthenticated(false);
        setUserName("");
      } else if (user) {
        setIsAuthenticated(true);
        let name = user.user_metadata?.name || "";

        if (!name) {
          const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("nombre")
            .eq("id_usuario", user.id)
            .single();

          if (!userError && userData) {
            name = userData.nombre;
          }
        }

        setUserName(name || "");
      }
    };

    fetchUser();
  }, []);

  // useEffect para obtener productos cuando cambia la consulta
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .ilike("nombre", `%${query}%`);

      if (error) {
        console.error("Error fetching products:", error);
        setError("Error al obtener los productos.");
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserName("");
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* Encabezado */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center h-auto sm:h-24 py-4 sm:py-0 space-y-4 sm:space-y-0">
            {/* Logo más grande y llamativo */}
            <div>
              <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🎮 JamedGames
              </span>
            </div>
  
            {/* Botones alineados completamente a la derecha */}
            <div className="ml-auto flex items-center space-x-4">
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/historial-pedidos")}
                title="Historial de pedidos"
              >
                <History className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/carrito")}
                title="Carrito"
              >
                <ShoppingCart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
  
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {userName && (
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {userName}
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Ingresar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
  
      {/* Contenido principal */}
      <main className="flex-grow overflow-y-auto">
        {/* Barra de búsqueda */}
        <div className="w-full max-w-md mx-auto px-2 mb-12 relative mt-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar juegos..."
            aria-label="Buscar juegos"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
  
        {/* Mensaje de error */}
        {error && (
          <div className="text-center text-red-500 mb-4">{error}</div>
        )}
  
        {/* Grid de productos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 sm:px-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-64 animate-pulse"
              >
                <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 sm:px-4">
            {products.map((producto) => (
              <ProductCard
                key={`product-${producto.id_producto}`}
                producto={producto}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-300">No se encontraron juegos</p>
          </div>
        )}
      </main>
  
      {/* Pie de página */}
      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-around items-center text-center gap-6">
            {/* Logos de marcas */}
            <div className="flex flex-col items-center space-y-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/XBOX_logo_2012.svg/640px-XBOX_logo_2012.svg.png"
                alt="Xbox"
                className="h-8"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg"
                alt="Nintendo"
                className="h-6"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/PlayStation_logo_and_wordmark.svg/1200px-PlayStation_logo_and_wordmark.svg.png?20201006114545"
                alt="PlayStation"
                className="h-8"
              />
            </div>
  
            {/* Derechos */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} JamedGames. Creado por Jair, Amed y Jemmy
            </div>
  
            {/* Redes sociales */}
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.29 20.29c7.72 0 12-6.72 12-12 0-.18-.01-.36-.02-.54.82-.59 1.52-1.31 2.07-2.14-.76.34-1.58.57-2.44.67.87-.52 1.56-1.34 1.88-2.32-.81.48-1.69.83-2.63 1.02-.76-.81-1.84-1.31-3.02-1.31-2.29 0-4.15 1.86-4.15 4.15 0 .33.04.65.12.95-3.45-.17-6.51-1.83-8.57-4.34-.36.62-.56 1.34-.56 2.11 0 1.46.74 2.75 1.86 3.51-.68-.02-1.33-.21-1.9-.53v.06c0 2.03 1.44 3.73 3.34 4.12-.35.1-.72.15-1.1.15-.27 0-.53-.03-.79-.08.53 1.64 2.07 2.83 3.91 2.86-1.43 1.12-3.23 1.78-5.18 1.78-.34 0-.68-.02-1.01-.06 1.88 1.21 4.13 1.92 6.53 1.92" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
  
}
