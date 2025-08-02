import { ClockIcon, CupsIcon, StarIcon } from '../icons/Icons';

const Descripcion = ({ name, image, difficulty, preparationTime, glassType }) => {
  const cocktailName = name || '';
  const imageSrc =
    image || `https://placehold.co/192x192/E2E8F0/4A5568?text=${encodeURIComponent(cocktailName)}`;

  // Mapeo de dificultades a colores
  const difficultyColors = {
    'muy fácil': 'bg-emerald-100 text-emerald-800',
    'muy facil': 'bg-emerald-100 text-emerald-800',
    fácil: 'bg-green-100 text-green-800',
    facil: 'bg-green-100 text-green-800',
    media: 'bg-yellow-100 text-yellow-800',
    medio: 'bg-yellow-100 text-yellow-800',
    difícil: 'bg-orange-100 text-orange-800',
    dificil: 'bg-orange-100 text-orange-800',
    'muy difícil': 'bg-red-100 text-red-800',
    'muy dificil': 'bg-red-100 text-red-800',
  };

  const difficultyColor =
    difficultyColors[difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800';

  return (
    <div className="p-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Imagen del cóctel */}
        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={imageSrc}
              alt={cocktailName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Información del cóctel */}
        <div className="space-y-6">
          <div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">{cocktailName}</h3>
            {difficulty && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${difficultyColor}`}
              >
                <StarIcon className="w-4 h-4 mr-1" />
                {difficulty}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {preparationTime !== null && preparationTime !== undefined && (
              <div className="flex items-center text-gray-700">
                <ClockIcon className="w-5 h-5 mr-3 text-blue-600" />
                <span className="text-lg">
                  <span className="font-semibold">{preparationTime}</span> minutos
                </span>
              </div>
            )}

            {glassType && (
              <div className="flex items-center text-gray-700">
                <CupsIcon className="w-4 h-4 mr-3 text-purple-600" />
                <span className="text-lg">
                  <span className="font-semibold">Copa:</span> {glassType.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Descripcion;
