import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { ArrowLeft } from "lucide-react";
import FormularioDireccion from "../components/FormularioDireccion";
import FormularioPago from "../components/FormularioPago";
import emailjs from '@emailjs/browser';


const Checkout = () => {
  const [step, setStep] = useState('direccion');
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Cargar carrito desde localStorage
        const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
        setCarrito(carritoLocal);
        setTotal(carritoLocal.reduce((sum, item) => sum + (item.precio * item.cantidad), 0));

        // 2. Obtener direcciones del usuario
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (user) {
          const { data, error: queryError } = await supabase
            .from("direccionusuario")
            .select("*")
            .eq("usuario_id", user.id);

          if (queryError) throw queryError;

          setDirecciones(data || []);
          if (data && data.length > 0) {
            setDireccionSeleccionada(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error al cargar direcciones:", err);
        setError("Error al cargar tus direcciones. Por favor intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Manejar guardado de nueva dirección
  const handleGuardarDireccion = async (nuevaDireccion) => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error: insertError } = await supabase
        .from("direccionusuario")
        .insert([{
          usuario_id: user.id, // Campo correcto según tu estructura de BD
          calle_numero: nuevaDireccion.calle_numero,
          colonia: nuevaDireccion.colonia,
          ciudad: nuevaDireccion.ciudad,
          estado: nuevaDireccion.estado,
          cp: nuevaDireccion.cp,
          telefono: nuevaDireccion.telefono
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setDirecciones(prev => [...prev, data]);
      setDireccionSeleccionada(data.id);
      return true;
    } catch (err) {
      console.error("Error al guardar dirección:", err);
      setError(err.message || "Error al guardar dirección");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarPago = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Validar dirección
      const direccion = direcciones.find(d => d.id === direccionSeleccionada);
      if (!direccion) throw new Error("Selecciona una dirección de envío");

      // 2. Obtener usuario
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Debes iniciar sesión");

      // 3. Crear pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          usuario_id: user.id,
          direccion_id: direccion.id,
          total: total
        }])
        .select()
        .single();
      if (pedidoError) throw pedidoError;

      // 4. Actualizar stock (CORRECCIÓN PRINCIPAL)
      for (const item of carrito) {
        const { error } = await supabase.rpc('decrementar_piezas', {
          product_id: item.id_producto,  // Nombre exacto del parámetro
          quantity: item.cantidad
        });
        if (error) throw error;
      }

      // 5. Insertar detalles del pedido
      const detallesPedido = carrito.map(item => ({
        id_pedido: pedido.id_pedido,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }));

      const { error: detallesError } = await supabase
        .from('detallepedido')
        .insert(detallesPedido);
      if (detallesError) throw detallesError;
      // 6. Enviar correo de confirmación
      try {
        const productosHtml = carrito.map(p => {
          return `Producto: ${p.nombre}, Cantidad: ${p.cantidad}, Precio: $${p.precio.toFixed(2)}`;
        }).join(''); // Unir todos los productos en una cadena HTML

        const templateParams = {
          usuario_nombre: user.user_metadata?.full_name || user.email.split('@')[0],
          usuario_email: user.email,
          pedido_id: pedido.id_pedido?.substring(0, 8).toUpperCase() || '------',
          productos: productosHtml,  // Aquí agregamos la lista HTML generada
          total: total.toFixed(2),
          fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
          direccion: `${direccion.calle_numero}, ${direccion.colonia}, ${direccion.ciudad}, ${direccion.estado}`,
        };

        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams
        );
      } catch (emailError) {
        console.error('Error al enviar correo:', emailError);
        setError('Pedido completado, pero no se pudo enviar el correo de confirmación. Revisa tu bandeja de spam.');
      }



      // 6. Redirigir a confirmación
      navigate("/enProceso", {
        state: {
          pedido: pedido,
          direccion: direccion,
          productos: carrito,
          total: total
        }
      });

      // 7. Limpiar carrito
      localStorage.removeItem('carrito');

    } catch (err) {
      console.error('Error en el proceso:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header y navegación */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => step === 'pago' ? setStep('direccion') : navigate(-1)}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500"
          >
            <ArrowLeft className="mr-2" />
            {step === 'pago' ? 'Cambiar dirección' : 'Volver'}
          </button>
  
          <div className="ml-auto flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm ${step === 'direccion' ? 'bg-blue-700 text-blue-200' : 'bg-gray-300 dark:bg-gray-700'}`}>
              1. Dirección
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${step === 'pago' ? 'bg-blue-700 text-blue-200' : 'bg-gray-300 dark:bg-gray-700'}`}>
              2. Pago
            </span>
          </div>
        </div>
  
        {error && (
          <div className="bg-red-600 border-l-4 border-red-800 text-red-100 p-4 mb-6 rounded">
            <p>{error}</p>
          </div>
        )}
  
        {/* Contenido principal */}
        {step === 'direccion' ? (
          <FormularioDireccion
            direcciones={direcciones}
            direccionSeleccionada={direccionSeleccionada}
            onSeleccionarDireccion={setDireccionSeleccionada}
            onGuardarDireccion={handleGuardarDireccion}
            onContinuar={() => {
              if (!direccionSeleccionada) {
                setError("Por favor selecciona una dirección");
                return;
              }
              setStep('pago');
            }}
            loading={loading}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Formulario de pago */}
            <div className="lg:w-2/3">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <FormularioPago
                  onProcesarPago={handleProcesarPago}
                  onCancelar={() => setStep('direccion')}
                  loading={loading}
                />
              </div>
            </div>
  
            {/* Resumen del pedido */}
            <div className="lg:w-1/3">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-300 dark:border-gray-700">
                  Resumen del pedido
                </h3>
  
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {carrito.map(item => (
                    <div key={item.id_producto} className="flex gap-4 py-2">
                      <div className="flex-shrink-0">
                        <img
                          src={item.imagen_url}
                          alt={item.nombre}
                          className="w-16 h-16 object-cover rounded-md"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.nombre}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Cantidad: {item.cantidad}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">${item.precio.toFixed(2)} c/u</p>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
  
                <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Envío</span>
                    <span className="text-green-600 dark:text-green-400">Gratis</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t border-gray-300 dark:border-gray-700">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};
export default Checkout;