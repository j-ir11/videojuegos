import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Package, Home } from 'lucide-react';

const EnProceso = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ⛔ Redirigir si no vienen datos del pedido
  useEffect(() => {
    if (!state?.pedido || !state?.productos || !state?.direccion) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  // Datos del pedido o valores por defecto
  const pedido = state?.pedido || {};
  const direccion = state?.direccion || {};
  const productos = state?.productos || [];
  const total = state?.total || 0;
  const fecha = state?.fecha ? new Date(state.fecha) : new Date();

  // Formatear fecha
  const opcionesFecha = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  const fechaFormateada = fecha.toLocaleDateString('es-MX', opcionesFecha);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Encabezado de confirmación */}
        <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-100">
          <div className="flex items-start">
            <CheckCircle className="text-green-500 mt-1 mr-4 flex-shrink-0" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
              <p className="text-gray-700 mb-1">
                Tu pedido <strong>#{pedido.id_pedido?.substring(0, 8).toUpperCase() || '------'}</strong> está siendo procesado.
              </p>
              <p className="text-gray-600">
                Recibirás una confirmación por correo electrónico.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Detalles del envío */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="text-blue-500 mr-2" size={20} />
              Información del pedido
            </h2>
            <div className="space-y-3">
              <p><span className="font-medium">Fecha:</span> {fechaFormateada}</p>
              <p><span className="font-medium">Estado:</span> <span className="text-yellow-600">En proceso</span></p>
              <p><span className="font-medium">Total:</span> ${total.toFixed(2)}</p>
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="text-blue-500 mr-2" size={20} />
              Dirección de envío
            </h2>
            {direccion.calle_numero ? (
              <div className="space-y-2">
                <p>{direccion.calle_numero}</p>
                <p>{direccion.colonia}, {direccion.ciudad}</p>
                <p>{direccion.estado}, CP {direccion.cp}</p>
                <p>Teléfono: {direccion.telefono}</p>
              </div>
            ) : (
              <p className="text-gray-500">No se proporcionó dirección</p>
            )}
          </div>
        </div>

        {/* Resumen de productos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <h2 className="text-lg font-semibold p-6 border-b border-gray-100 flex items-center">
            <Package className="text-blue-500 mr-2" size={20} />
            Resumen de tu compra
          </h2>

          <div className="divide-y divide-gray-100">
            {productos.map((producto, index) => (
              <div key={index} className="p-4 flex items-start">
                {producto.imagen_url && (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-16 h-16 object-cover rounded-md mr-4 border border-gray-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{producto.nombre}</h3>
                  <p className="text-gray-600 text-sm">Cantidad: {producto.cantidad}</p>
                  <p className="text-gray-600 text-sm">Precio unitario: ${producto.precio?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="font-medium">
                  ${((producto.precio || 0) * (producto.cantidad || 0)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/', { replace: true })}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Home className="mr-2" size={18} />
            Volver al inicio
          </button>

          <button
            onClick={() => navigate('/historial-pedidos')}
            className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Ver mis pedidos
          </button>
        </div>

        {/* Mensaje adicional */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Si tienes alguna pregunta sobre tu pedido, contáctanos en soporte@tienda.com</p>
        </div>
      </div>
    </div>
  );
};

export default EnProceso;
