import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '../icons/Icons';

function FilterDropdown({
  placeholder,
  options = [],
  value,
  onChange,
  disabled = false,
  className = '',
  // Props para funcionalidades avanzadas
  showColors = false,
  showSystemBadges = false,
  renderCustomOption = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = optionValue => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  // Función para renderizar el contenido de cada opción
  const renderOptionContent = option => {
    // Si hay un renderizador personalizado, usarlo
    if (renderCustomOption) {
      return renderCustomOption(option);
    }

    // Renderizado avanzado para categorías
    if (showColors || showSystemBadges) {
      return (
        <div className="flex items-center space-x-2">
          {/* Indicador de color si existe */}
          {showColors && option.color && (
            <div
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: option.color }}
            />
          )}

          <span>{option.label}</span>

          {/* Indicador de categoría del sistema */}
          {showSystemBadges && option.isSystem && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
              Sistema
            </span>
          )}
        </div>
      );
    }

    // Renderizado simple por defecto
    return option.label;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full min-w-0 text-left appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-300 transition-shadow cursor-pointer ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundImage: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          minWidth: '190px', // Ancho mínimo fijo
        }}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </button>

      {/* Arrow icon */}
      <ChevronDownIcon
        className={`w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none ${
          isOpen ? 'rotate-180' : ''
        }`}
      />

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Opción vacía */}
          <button
            type="button"
            onClick={() => handleSelect('')}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {placeholder}
          </button>

          {/* Separador si hay opciones */}
          {options.length > 0 && <div className="border-t border-gray-200" />}

          {/* Opciones */}
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors capitalize ${
                option.value === value
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {renderOptionContent(option)}
            </button>
          ))}

          {/* Mensaje si no hay opciones */}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 italic">
              No hay opciones disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
