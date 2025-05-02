  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import { supabase } from "../services/supabaseClient";
  import { ArrowLeft, ShoppingCart } from "lucide-react";

  const Carrito = () => {
    const [carrito, setCarrito] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchCarritoConStock = async () => {
        const localCarrito = JSON.parse(localStorage.getItem("carrito")) || [];

        const ids = localCarrito.map(item => item.id_producto);
        const { data: productosStock, error } = await supabase
          .from("productos")
          .select("id_producto, piezas")
          .in("id_producto", ids);

        if (error) {
          console.error("Error al obtener stock:", error);
          return;
        }

        const carritoConStock = localCarrito.map(item => {
          const producto = productosStock.find(p => p.id_producto === item.id_producto);
          return {
            ...item,
            stockDisponible: producto ? producto.piezas : 0
          };
        });

        setCarrito(carritoConStock);
      };

      fetchCarritoConStock();

      // Verificar si el usuario está logueado
      const checkAuthStatus = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      };

      checkAuthStatus();
    }, []);

    const actualizarCarrito = (nuevoCarrito) => {
      setCarrito(nuevoCarrito);
      localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
    };

    const eliminarProducto = (id_producto) => {
      const actualizado = carrito.filter(item => item.id_producto !== id_producto);
      actualizarCarrito(actualizado);
    };

    const cambiarCantidad = (id_producto, nuevaCantidad) => {
      const actualizado = carrito.map(item => {
        if (item.id_producto === id_producto) {
          if (nuevaCantidad >= 1 && nuevaCantidad <= item.stockDisponible) {
            return { ...item, cantidad: nuevaCantidad };
          }
        }
        return item;
      });
      actualizarCarrito(actualizado);
    };

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const handleComprarClick = () => {
      const haySinStock = carrito.some(item => item.stockDisponible === 0);
    
      if (haySinStock) {
        alert("Uno o más productos no tienen stock disponible. Elimínalos antes de continuar.");
        return;
      }
    
      if (isAuthenticated) {
        navigate("/checkout", { state: { from: "/carrito" } });
      } else {
        navigate("/login", { state: { message: "Para comprar, necesitas iniciar sesión." } });
      }
    };
    

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Botón de regresar */}
          <button
            onClick={() => {
             
                navigate("/"); // Si sí hay historial útil, vuelve atrás
            
            }}
            className="flex items-center text-blue-600 mb-6"
          >
            <ArrowLeft className="mr-2" />
            Volver atrás
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Carrito de compras</h1>

          {carrito.length === 0 ? (
            <p>No tienes productos en el carrito.</p>
          ) : (
            <div>
              {carrito.map((item) => (
                <div key={item.id_producto} className="flex items-center justify-between bg-white p-4 mb-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <img src={item.imagen_url} alt={item.nombre} className="w-20 h-20 object-contain" />
                    <div className="ml-4">
                      <h2 className="text-lg font-bold">{item.nombre}</h2>
                      <p>${item.precio}</p>
                      <p className="text-sm text-gray-500">Stock: {item.stockDisponible}</p>
                      {item.stockDisponible === 0 && (
                          <p className="text-sm text-red-600">¡Este producto está agotado!</p>
                        )}
                      <div className="flex items-center mt-2">
    
                        <button
                          className="px-2 py-1 border rounded hover:bg-gray-200"
                          onClick={() => cambiarCantidad(item.id_producto, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                        >
                          −
                        </button>
                        <span className="mx-3">{item.cantidad}</span>
                        <button
                          className="px-2 py-1 border rounded hover:bg-gray-200"
                          onClick={() => cambiarCantidad(item.id_producto, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stockDisponible}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-red-600"
                    onClick={() => eliminarProducto(item.id_producto)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              <div className="mt-6 flex justify-between items-center">
                <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
                <button
                  onClick={handleComprarClick}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Comprar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default Carrito;
