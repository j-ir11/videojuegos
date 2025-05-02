import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

export default function ProductCard({ producto }) {
  const navigate = useNavigate();
  if (!producto) return null;

  return (
    <div 
      onClick={() => navigate(`/producto/${producto.id_producto}`)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 overflow-hidden"
    >
      <div className="bg-gray-100 p-4 flex justify-center items-center h-48">
        <img 
          src={producto.imagen_url || '/placeholder-image.jpg'} 
          alt={producto.nombre || 'Producto sin nombre'}
          className="max-h-36 object-contain"
        />
      </div>

      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {producto.nombre || 'Nombre no disponible'}
        </h3>

        <div className="flex items-center gap-1 my-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={`star-${producto.id_producto}-${i}`}
                size={16} 
                className={i < 4 ? "fill-current" : ""}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">(124)</span>
        </div>

        <p className="text-lg font-bold text-emerald-600">${producto.precio}</p>
      </div>
    </div>
  );
}
