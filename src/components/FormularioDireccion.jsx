import React, { useState } from 'react';
import { Plus, Check, ArrowRight } from 'lucide-react';

const FormularioDireccion = ({
  direcciones = [],
  direccionSeleccionada = null,
  onSeleccionarDireccion,
  onGuardarDireccion,
  onContinuar,
  loading = false
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    calle_numero: '',
    colonia: '',
    ciudad: '',
    estado: '',
    cp: '',
    telefono: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.calle_numero.trim()) newErrors.calle_numero = 'Requerido';
    if (!formData.colonia.trim()) newErrors.colonia = 'Requerido';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'Requerido';
    if (!formData.estado.trim()) newErrors.estado = 'Requerido';
    if (!/^\d{5}$/.test(formData.cp)) newErrors.cp = 'CP inválido';
    if (!/^\d{10}$/.test(formData.telefono)) newErrors.telefono = 'Teléfono inválido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const success = await onGuardarDireccion(formData);
      if (success) {
        setMostrarFormulario(false);
        setFormData({
          calle_numero: '',
          colonia: '',
          ciudad: '',
          estado: '',
          cp: '',
          telefono: ''
        });
      }
    }
  };

  return (
    <div className="divide-y">
      {/* Lista de direcciones */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Selecciona una dirección</h2>
        
        <div className="space-y-3">
          {direcciones.length === 0 && !mostrarFormulario && (
            <p className="text-gray-500 text-center py-4">No tienes direcciones guardadas</p>
          )}
          
          {direcciones.map(direccion => (
            <div 
              key={direccion.id}
              onClick={() => onSeleccionarDireccion(direccion.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                direccionSeleccionada === direccion.id 
                  ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start">
                <div className={`flex-1 ${direccionSeleccionada === direccion.id ? 'text-blue-800' : 'text-gray-800'}`}>
                  <p className="font-medium">{direccion.calle_numero}</p>
                  <p className="text-sm">{direccion.colonia}, {direccion.ciudad}</p>
                  <p className="text-sm">{direccion.estado}, CP {direccion.cp}</p>
                  <p className="text-sm mt-1">Tel: {direccion.telefono}</p>
                </div>
                {direccionSeleccionada === direccion.id && (
                  <Check className="text-blue-500 ml-2 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center justify-center transition-colors"
        >
          <Plus className="mr-2" size={16} />
          {mostrarFormulario ? 'Cancelar' : 'Agregar nueva dirección'}
        </button>
      </div>

      {/* Formulario para nueva dirección */}
      {mostrarFormulario && (
        <div className="p-6 bg-gray-50">
          <h3 className="font-medium mb-4">Nueva dirección de envío</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle y número*</label>
                <input
                  type="text"
                  value={formData.calle_numero}
                  onChange={(e) => setFormData({...formData, calle_numero: e.target.value})}
                  className={`w-full p-2 border rounded-md ${errors.calle_numero ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.calle_numero && <p className="text-red-500 text-xs mt-1">{errors.calle_numero}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colonia*</label>
                <input
                  type="text"
                  value={formData.colonia}
                  onChange={(e) => setFormData({...formData, colonia: e.target.value})}
                  className={`w-full p-2 border rounded-md ${errors.colonia ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.colonia && <p className="text-red-500 text-xs mt-1">{errors.colonia}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad*</label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                  className={`w-full p-2 border rounded-md ${errors.ciudad ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.ciudad && <p className="text-red-500 text-xs mt-1">{errors.ciudad}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado*</label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  className={`w-full p-2 border rounded-md ${errors.estado ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal*</label>
                <input
                  type="text"
                  value={formData.cp}
                  onChange={(e) => setFormData({...formData, cp: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                  className={`w-full p-2 border rounded-md ${errors.cp ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.cp && <p className="text-red-500 text-xs mt-1">{errors.cp}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono*</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                className={`w-full p-2 border rounded-md ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md flex items-center ${
                  loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Guardando...' : 'Guardar dirección'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Botón de continuar */}
      {!mostrarFormulario && direccionSeleccionada && (
        <div className="p-4 bg-white border-t sticky bottom-0">
          <button
            onClick={onContinuar}
            disabled={loading || !direccionSeleccionada}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
              loading || !direccionSeleccionada
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Continuar al pago
            <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FormularioDireccion;