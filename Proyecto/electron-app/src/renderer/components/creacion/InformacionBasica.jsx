import { useCallback } from 'react';
import PropTypes from 'prop-types';

function InformacionBasica({ data, onChange }) {
  const handleChange = useCallback(
    (field, value) => {
      onChange({ [field]: value });
    },
    [onChange],
  );

  const difficultyOptions = [
    { value: 'muy fácil', label: 'Muy Fácil', description: 'Mezclar y servir' },
    { value: 'fácil', label: 'Fácil', description: 'Sin técnicas especiales' },
    { value: 'media', label: 'Media', description: 'Requiere algunas técnicas' },
    { value: 'difícil', label: 'Difícil', description: 'Técnicas avanzadas' },
    { value: 'muy difícil', label: 'Muy Difícil', description: 'Técnicas profesionales' },
  ];

  const glassOptions = [
    { value: 'rocks_glass', label: 'Vaso Old Fashioned' },
    { value: 'highball_glass', label: 'Vaso Highball' },
    { value: 'martini_glass', label: 'Copa Martini' },
    { value: 'coupe_glass', label: 'Copa Coupe' },
    { value: 'hurricane_glass', label: 'Vaso Hurricane' },
    { value: 'wine_glass', label: 'Copa de Vino' },
    { value: 'shot_glass', label: 'Vaso de Shot' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Información Básica</h2>
        <p className="text-gray-600">Comencemos con los detalles fundamentales de tu cóctel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre del cóctel */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del cóctel *
          </label>
          <input
            type="text"
            id="name"
            value={data.name || ''}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Ej: Margarita de Mango"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            required
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            value={data.description || ''}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Describe brevemente tu cóctel..."
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none"
          />
        </div>

        {/* Dificultad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nivel de dificultad *
          </label>
          <div className="space-y-2">
            {difficultyOptions.map(option => (
              <label
                key={option.value}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={option.value}
                  checked={data.difficulty === option.value}
                  onChange={e => handleChange('difficulty', e.target.value)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-300"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tipo de vaso */}
        <div>
          <label htmlFor="glassType" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de vaso
          </label>
          <select
            id="glassType"
            value={data.glass_type || ''}
            onChange={e => handleChange('glass_type', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          >
            <option value="">Selecciona un vaso</option>
            {glassOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tiempo de preparación */}
        <div>
          <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700 mb-2">
            Tiempo de preparación (minutos)
          </label>
          <input
            type="number"
            id="prepTime"
            value={data.preparation_time || ''}
            onChange={e => handleChange('preparation_time', parseInt(e.target.value) || null)}
            placeholder="Ej: 5"
            min="1"
            max="60"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          />
        </div>

        {/* Contenido de alcohol */}
        <div>
          <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700 mb-2">
            Contenido de alcohol (% ABV)
          </label>
          <input
            type="number"
            id="alcoholContent"
            value={data.alcohol_content || ''}
            onChange={e => handleChange('alcohol_content', parseFloat(e.target.value) || null)}
            placeholder="Ej: 15"
            min="0"
            max="50"
            step="0.1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          />
        </div>

        {/* Guarnición */}
        <div className="md:col-span-2">
          <label htmlFor="garnish" className="block text-sm font-medium text-gray-700 mb-2">
            Guarnición
          </label>
          <input
            type="text"
            id="garnish"
            value={data.garnish || ''}
            onChange={e => handleChange('garnish', e.target.value)}
            placeholder="Ej: Rodaja de lima y sal en el borde"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          />
        </div>

        {/* Sugerencia de servido */}
        <div className="md:col-span-2">
          <label
            htmlFor="servingSuggestion"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sugerencia de servido
          </label>
          <input
            type="text"
            id="servingSuggestion"
            value={data.serving_suggestion || ''}
            onChange={e => handleChange('serving_suggestion', e.target.value)}
            placeholder="Ej: Servir bien frío con hielo"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

InformacionBasica.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    difficulty: PropTypes.string,
    glass_type: PropTypes.string,
    preparation_time: PropTypes.number,
    alcohol_content: PropTypes.number,
    garnish: PropTypes.string,
    serving_suggestion: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default InformacionBasica;
