import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Star } from "lucide-react";

const ProductoDetalle = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stockDisponible, setStockDisponible] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("id_producto", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        navigate("/");
      } else {
        setProducto(data);
        setStockDisponible(data.piezas || 0); // Establecer el stock disponible
        // Si hay menos stock que la cantidad inicial, ajustar
        if (data.piezas < cantidad) {
          setCantidad(Math.max(1, data.piezas));
        }
      }
      setLoading(false);
    };

    fetchProducto();
  }, [id, navigate]);

  const agregarAlCarrito = () => {
    if (cantidad > stockDisponible) {
      alert("No hay suficiente stock disponible");
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productoExistente = carrito.find(item => item.id_producto === producto.id_producto);

    if (productoExistente) {
      // Verificar que no exceda el stock al sumar
      if (productoExistente.cantidad + cantidad > stockDisponible) {
        alert("No puedes agregar más unidades de las disponibles en stock");
        return;
      }
      productoExistente.cantidad += cantidad;
    } else {
      carrito.push({
        ...producto,
        cantidad,
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    navigate("/carrito");
  };

  const aumentarCantidad = () => {
    if (cantidad < stockDisponible) {
      setCantidad(cantidad + 1);
    } else {
      alert("No hay más stock disponible");
    }
  };

  const disminuirCantidad = () => {
    setCantidad(Math.max(1, cantidad - 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 dark:text-blue-400 mb-6 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="mr-2" /> Volver atrás
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-300">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/2 p-8 bg-gray-50 dark:bg-gray-700/30">
              <img
                className="w-full h-96 object-contain"
                src={producto.imagen_url}
                alt={producto.nombre}
              />
            </div>
            <div className="p-8 md:w-1/2">
              <div className="uppercase tracking-wide text-sm text-blue-600 dark:text-blue-400 font-semibold">
                {producto.plataforma || "Multiplataforma"}
              </div>
              <h1 className="block mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                {producto.nombre}
              </h1>
              <div className="mt-4 flex items-center">
                <div className="flex text-amber-400 dark:text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < (producto.rating || 4) ? "fill-current" : ""}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  ({producto.reviews || 124} reseñas)
                </span>
              </div>
              <p className="mt-6 text-gray-600 dark:text-gray-300">
                {producto.descripcion}
              </p>

              <div className="mt-8 border-t pt-6 border-gray-200 dark:border-gray-700">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${producto.precio}
                  {producto.precio_original && (
                    <span className="ml-2 text-lg text-gray-500 dark:text-gray-400 line-through">
                      ${producto.precio_original}
                    </span>
                  )}
                </p>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {stockDisponible > 0 
                    ? `Stock disponible: ${stockDisponible} unidades`
                    : "Producto agotado"}
                </p>

                <div className="flex items-center mt-4">
                  <button
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                    onClick={disminuirCantidad}
                    disabled={cantidad <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={cantidad}
                    readOnly
                    className="mx-4 w-12 text-center border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
                    onClick={aumentarCantidad}
                    disabled={cantidad >= stockDisponible}
                  >
                    +
                  </button>
                </div>

                <button
                  className={`mt-6 px-6 py-3 text-white font-medium rounded-lg flex items-center transition-colors ${
                    stockDisponible > 0 
                      ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" 
                      : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  }`}
                  onClick={agregarAlCarrito}
                  disabled={stockDisponible <= 0}
                >
                  <ShoppingCart className="mr-2" />
                  {stockDisponible > 0 ? "Añadir al carrito" : "Sin stock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;