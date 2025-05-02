import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

export default function ProductCard({ producto }) {
  const navigate = useNavigate();
  if (!producto) return null;

  return (
    <div 
      onClick={() => navigate(`/producto/${producto.id_producto}`)}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl dark:hover:shadow-gray-700/50 transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-gray-300 dark:hover:border-gray-500"
    >
      <div className="bg-gray-100 dark:bg-gray-700/80 p-4 flex justify-center items-center h-48 transition-colors duration-300">
        <img 
          src={producto.imagen_url || '/placeholder-image.jpg'} 
          alt={producto.nombre || 'Producto sin nombre'}
          className="max-h-36 object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      </div>

      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate transition-colors duration-300">
          {producto.nombre || 'Nombre no disponible'}
        </h3>

        <div className="flex items-center gap-1 my-2">
          <div className="flex text-yellow-400 dark:text-yellow-300/90">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={`star-${producto.id_producto}-${i}`}
                size={16} 
                className={`transition-colors duration-300 ${i < 4 ? "fill-current" : "text-opacity-40 dark:text-opacity-40"}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400/90 transition-colors duration-300">
            ({producto.rating_count || 124})
          </span>
        </div>

        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400/90 transition-colors duration-300">
          ${producto.precio?.toLocaleString() || '0'}
        </p>
      </div>
    </div>
  );
}