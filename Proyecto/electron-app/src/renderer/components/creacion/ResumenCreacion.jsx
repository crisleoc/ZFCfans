import PropTypes from 'prop-types';

function ResumenCreacion({ data, onSubmit, isSubmitting }) {
  const {
    name,
    description,
    difficulty,
    glass_type,
    preparation_time,
    alcohol_content,
    garnish,
    serving_suggestion,
    ingredients = [],
    instructions = [],
    image_url,
    image_credits,
  } = data;

  const isComplete = name && difficulty && ingredients.length > 0 && instructions.length > 0;

  const difficultyLabels = {
    'muy fácil': 'Muy Fácil',
    fácil: 'Fácil',
    media: 'Media',
    difícil: 'Difícil',
    'muy difícil': 'Muy Difícil',
  };

  const glassLabels = {
    rocks_glass: 'Vaso Old Fashioned',
    highball_glass: 'Vaso Highball',
    martini_glass: 'Copa Martini',
    coupe_glass: 'Copa Coupe',
    hurricane_glass: 'Vaso Hurricane',
    wine_glass: 'Copa de Vino',
    shot_glass: 'Vaso de Shot',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Resumen y Confirmación</h2>
        <p className="text-gray-600">Revisa todos los detalles antes de guardar tu cóctel</p>
      </div>

      {/* Estado de completitud */}
      <div
        className={`p-4 rounded-lg border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}
      >
        <div className="flex items-center gap-2">
          {isComplete ? (
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          )}
          <span className={`font-medium ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
            {isComplete ? 'Cóctel listo para guardar' : 'Faltan algunos campos obligatorios'}
          </span>
        </div>
        {!isComplete && (
          <div className="mt-2 text-sm text-yellow-700">
            <p>Campos requeridos:</p>
            <ul className="list-disc list-inside ml-4 mt-1">
              {!name && <li>Nombre del cóctel</li>}
              {!difficulty && <li>Nivel de dificultad</li>}
              {ingredients.length === 0 && <li>Al menos un ingrediente</li>}
              {instructions.length === 0 && <li>Al menos una instrucción</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Preview del cóctel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Imagen */}
        <div className="lg:col-span-1">
          {image_url ? (
            <div className="space-y-2">
              <img
                src={image_url}
                alt={name || 'Preview del cóctel'}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              {image_credits && <p className="text-xs text-gray-500 italic">{image_credits}</p>}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg
                  className="w-8 h-8 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">Sin imagen</span>
              </div>
            </div>
          )}
        </div>

        {/* Información básica */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{name || 'Sin nombre'}</h3>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {difficulty && (
              <div>
                <span className="text-gray-500">Dificultad:</span>
                <p className="font-medium">{difficultyLabels[difficulty]}</p>
              </div>
            )}
            {glass_type && (
              <div>
                <span className="text-gray-500">Vaso:</span>
                <p className="font-medium">{glassLabels[glass_type]}</p>
              </div>
            )}
            {preparation_time && (
              <div>
                <span className="text-gray-500">Tiempo:</span>
                <p className="font-medium">{preparation_time} min</p>
              </div>
            )}
            {alcohol_content && (
              <div>
                <span className="text-gray-500">Alcohol:</span>
                <p className="font-medium">{alcohol_content}% ABV</p>
              </div>
            )}
          </div>

          {(garnish || serving_suggestion) && (
            <div className="space-y-2 text-sm">
              {garnish && (
                <div>
                  <span className="text-gray-500">Guarnición:</span>
                  <span className="ml-2">{garnish}</span>
                </div>
              )}
              {serving_suggestion && (
                <div>
                  <span className="text-gray-500">Servido:</span>
                  <span className="ml-2">{serving_suggestion}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ingredientes */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Ingredientes ({ingredients.length})
        </h4>
        {ingredients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ingredients.map(ingredient => (
              <div
                key={`summary-ingredient-${ingredient.name}-${ingredient.quantity}`}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{ingredient.name}</span>
                <span className="text-gray-600">
                  {ingredient.quantity} {ingredient.unit}
                  {ingredient.notes && <span className="text-xs ml-1">({ingredient.notes})</span>}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay ingredientes añadidos</p>
        )}
      </div>

      {/* Instrucciones */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Instrucciones ({instructions.length} pasos)
        </h4>
        {instructions.length > 0 ? (
          <div className="space-y-2">
            {instructions.map(instruction => (
              <div
                key={`summary-instruction-${instruction.step}-${instruction.description.slice(0, 20)}`}
                className="flex gap-3 p-3 bg-gray-50 rounded"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {instruction.step}
                </div>
                <p className="text-gray-700">{instruction.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay instrucciones añadidas</p>
        )}
      </div>

      {/* Botón de guardar */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className={`
            flex-1 px-6 py-3 rounded-lg font-semibold transition-colors
            ${
              isComplete && !isSubmitting
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Guardando cóctel...
            </div>
          ) : (
            'Guardar Cóctel'
          )}
        </button>

        <div className="text-sm text-gray-500 self-center">
          {isComplete
            ? 'Tu cóctel será añadido a la colección'
            : 'Completa los campos requeridos para continuar'}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Información</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Tu cóctel será guardado y estará disponible inmediatamente</li>
          <li>• Podrás editarlo o eliminarlo desde el catálogo</li>
          <li>• Otros usuarios podrán ver y valorar tu creación</li>
        </ul>
      </div>
    </div>
  );
}

ResumenCreacion.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    difficulty: PropTypes.string,
    glass_type: PropTypes.string,
    preparation_time: PropTypes.number,
    alcohol_content: PropTypes.number,
    garnish: PropTypes.string,
    serving_suggestion: PropTypes.string,
    ingredients: PropTypes.array,
    instructions: PropTypes.array,
    image_url: PropTypes.string,
    image_credits: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default ResumenCreacion;
