import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        
        if (!user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        const { data, error: queryError } = await supabase
          .from("pedidos")
          .select(`
            id_pedido,
            fecha,
            total,
            direccion_id,
            usuario_id,
            direccionUsuario: direccion_id (calle_numero, colonia, ciudad, estado),
            detallepedido: detallepedido (
              cantidad,
              precio_unitario,
              productos: id_producto (nombre, imagen_url)
            )
          `)
          .eq("usuario_id", user.id)
          .order("fecha", { ascending: false });

        if (queryError) throw queryError;

        setPedidos(data || []);
      } catch (err) {
        console.error("Error al obtener pedidos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [navigate]);

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Historial de Pedidos</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Aún no has iniciado sesión. Inicia sesión para ver tu historial de pedidos.</p>
          
          <div className="flex flex-col space-y-3 items-center">
            <button
              onClick={() => navigate("/login")}
              className="w-full max-w-xs flex justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a iniciar sesión
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full max-w-xs flex justify-center items-center px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Home className="mr-2" size={18} />
              Regresar al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div className="max-w-4xl mx-auto px-4 py-8">
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
    >
      <ArrowLeft className="mr-2" />
      Volver
    </button>

    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Historial de Pedidos</h1>

    {error && (
      <div className="bg-red-100 dark:bg-red-200/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded">
        <p>{error}</p>
      </div>
    )}

    {loading ? (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    ) : pedidos.length > 0 ? (
      <div className="space-y-6">
        {pedidos.map((pedido) => (
          <div key={pedido.id_pedido} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold dark:text-white">
                    Pedido #{pedido.id_pedido.substring(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">{formatFecha(pedido.fecha)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold dark:text-white">${pedido.total.toFixed(2)}</p>
                  {pedido.direccionUsuario && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {pedido.direccionUsuario.ciudad}, {pedido.direccionUsuario.estado}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-medium dark:text-white mb-3">Productos:</h3>
              <div className="space-y-3">
                {pedido.detallepedido?.map((detalle, i) => (
                  <div key={i} className="flex items-center">
                    {detalle.productos?.imagen_url && (
                      <img
                        src={detalle.productos.imagen_url}
                        alt={detalle.productos.nombre}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium dark:text-white truncate">
                        {detalle.productos?.nombre || "Producto no disponible"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {detalle.cantidad} × ${detalle.precio_unitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="font-medium dark:text-white">
                      ${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 dark:text-gray-300">No tienes pedidos registrados</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ir a la tienda
        </button>
      </div>
    )}
  </div>
</div>

  );
}