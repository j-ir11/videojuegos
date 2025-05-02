import React, { useState } from 'react';
import { CreditCard, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const FormularioPago = ({ onProcesarPago, onCancelar, loading }) => {
  const [formData, setFormData] = useState({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isValidMastercard = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length !== 16) return false;
    const firstTwo = parseInt(cleaned.substring(0, 2));
    const firstFour = parseInt(cleaned.substring(0, 4));
    return (firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720);
  };

  const isValidLuhn = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let alternate = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      if (alternate) {
        digit *= 2;
        if (digit > 9) digit = (digit % 10) + 1;
      }
      sum += digit;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  };

  const isValidExpiryDate = (dateStr) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(dateStr)) return false;
    const [month, year] = dateStr.split('/');
    const expiryDate = new Date(parseInt(`20${year}`), parseInt(month), 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    expiryDate.setDate(0);
    return expiryDate >= today;
  };

  const validate = () => {
    const newErrors = {};
    const cardNumber = formData.numeroTarjeta.replace(/\s/g, '');
    if (!isValidMastercard(cardNumber)) {
      newErrors.numeroTarjeta = 'Número de Mastercard inválido';
    } else if (!isValidLuhn(cardNumber)) {
      newErrors.numeroTarjeta = 'Número de tarjeta inválido';
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombreTitular.trim())) {
      newErrors.nombreTitular = 'Solo se permiten letras y espacios';
    } else if (formData.nombreTitular.trim().length < 5) {
      newErrors.nombreTitular = 'Nombre demasiado corto';
    }

    if (!isValidExpiryDate(formData.fechaExpiracion)) {
      newErrors.fechaExpiracion = 'Fecha inválida o tarjeta expirada';
    }

    if (!/^\d{3}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV debe tener 3 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validate();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onProcesarPago({
        ...formData,
        numeroTarjeta: formData.numeroTarjeta.replace(/\s/g, '')
      });
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiryDate = (value) => {
    return value.replace(/[^0-9]/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
  };

  const formatName = (value) => {
    return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onCancelar}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="mr-2" size={18} />
          Volver a dirección
        </button>

        <h2 className="text-xl font-semibold flex items-center text-gray-900 dark:text-white">
          <CreditCard className="mr-2 text-blue-500" size={20} />
          Método de pago
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Número de tarjeta Mastercard
          </label>
          <input
            type="text"
            value={formData.numeroTarjeta}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, numeroTarjeta: formatCardNumber(inputValue) });
            }}
            onBlur={() => handleBlur('numeroTarjeta')}
            placeholder="1234 5678 9012 3456"
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
              errors.numeroTarjeta ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            inputMode="numeric"
          />
          {errors.numeroTarjeta && (
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.numeroTarjeta}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre del titular
          </label>
          <input
            type="text"
            value={formData.nombreTitular}
            onChange={(e) => setFormData({ ...formData, nombreTitular: formatName(e.target.value) })}
            onBlur={() => handleBlur('nombreTitular')}
            placeholder="Como aparece en la tarjeta"
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
              errors.nombreTitular ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.nombreTitular && (
            <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.nombreTitular}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de expiración (MM/AA)
            </label>
            <input
              type="text"
              value={formData.fechaExpiracion}
              onChange={(e) => setFormData({ ...formData, fechaExpiracion: formatExpiryDate(e.target.value) })}
              onBlur={() => handleBlur('fechaExpiracion')}
              placeholder="MM/AA"
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.fechaExpiracion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              inputMode="numeric"
            />
            {errors.fechaExpiracion && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.fechaExpiracion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CVV (3 dígitos)
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
              onBlur={() => handleBlur('cvv')}
              placeholder="123"
              className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              inputMode="numeric"
            />
            {errors.cvv && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-colors ${
              loading
                ? 'bg-green-400 dark:bg-green-500 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={18} />
                Procesando pago...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2" size={18} />
                Confirmar y pagar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioPago;
