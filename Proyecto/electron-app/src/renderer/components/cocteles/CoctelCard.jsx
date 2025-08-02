import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { ClockIcon, HeartIcon, StarIcon, TagIcon } from '../icons/Icons';
import { useFavorites } from '../../hooks/useFavorites';
import CategoryController from '../../controllers/CategoryController';
import CategoryModal from '../modals/CategoryModal';

function CoctelCard({ coctel }) {
  const { navigateTo } = useNavigation();
  const { toggleFavorite } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);
  const [cocktailCategories, setCocktailCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { nombre, imagen, id, difficulty = 'fácil', tiempo_preparacion } = coctel;

  // Manejar valores NULL/undefined para preparation time
  const preparationTime = tiempo_preparacion ?? 5;

  const loadCocktailData = useCallback(async () => {
    try {
      // Cargar categorías del cóctel
      const categories = await CategoryController.getCocktailCategories(id);
      setCocktailCategories(categories || []);

      // Verificar si está en favoritos
      const favoriteCategory = categories?.find(cat => cat.name === 'Favoritos');
      setIsFavorite(!!favoriteCategory);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading cocktail data:', error);
    }
  }, [id]);

  // Cargar estado de favorito y categorías al montar
  useEffect(() => {
    loadCocktailData();
  }, [loadCocktailData]);

  const getDifficultyStars = difficulty => {
    let stars = 1;
    switch (difficulty?.toLowerCase()) {
      case 'muy fácil':
      case 'muy facil':
        stars = 1;
        break;
      case 'fácil':
      case 'facil':
        stars = 2;
        break;
      case 'media':
      case 'medio':
        stars = 3;
        break;
      case 'difícil':
      case 'dificil':
        stars = 4;
        break;
      case 'muy difícil':
      case 'muy dificil':
        stars = 5;
        break;
      default:
        stars = 2;
    }

    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`w-3 h-3 ${index < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
      />
    ));
  };

  const getCategoryStyle = categoria => {
    if (categoria.color) {
      return {
        backgroundColor: `${categoria.color}1A`, // 10% opacity
        color: categoria.color,
        borderColor: `${categoria.color}4D`, // 30% opacity
      };
    }

    return {};
  };

  const handleFavoriteToggle = async e => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await toggleFavorite(id);
      // Recargar datos para actualizar estado
      await loadCocktailData();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = e => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCategoryModalConfirm = async () => {
    // Recargar categorías después de confirmar cambios
    await loadCocktailData();
  };

  // Filtrar categorías que no sean "Favoritos" para mostrar
  const displayCategories = cocktailCategories.filter(cat => cat.name !== 'Favoritos');

  return (
    <>
      <div className="cocktail-card flex flex-col items-center text-center bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image container with overlays */}
        <div className="relative w-full h-48">
          <img
            src={imagen || 'https://placehold.co/192x192/E2E8F0/4A5568?text=Cóctel'}
            alt={nombre}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
          />

          {/* Difficulty stars - top right */}
          <div className="absolute top-2 right-2 flex space-x-1 bg-black bg-opacity-50 rounded-lg px-2 py-1">
            {getDifficultyStars(difficulty)}
          </div>

          {/* Preparation time - bottom left */}
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black bg-opacity-50 rounded-lg px-2 py-1 text-white text-xs">
            <ClockIcon className="w-3 h-3" />
            <span>{preparationTime} min</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 w-full flex-1 flex flex-col">
          {/* Cocktail name */}
          <h3 className="text-lg font-bold text-gray-800 mb-3">{nombre}</h3>

          {/* Categories - scrollable */}
          {displayCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4 max-h-16 overflow-y-auto capitalize">
              {displayCategories.map(categoria => {
                const categoryStyle = getCategoryStyle(categoria);
                const hasCustomColor = categoria.color;

                return (
                  <span
                    key={categoria.id}
                    className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${
                      hasCustomColor ? '' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                    style={hasCustomColor ? categoryStyle : {}}
                  >
                    {categoria.name}
                  </span>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2 mt-auto">
            {/* Ver detalles button */}
            <button
              onClick={() => navigateTo('resumen-informativo', { recipeId: id, nombre, imagen })}
              className="flex-1 btn-secondary focus-ring py-2 px-3 rounded-lg font-medium text-sm"
            >
              Ver detalles
            </button>

            {/* Favorite button */}
            <button
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className={`p-2 rounded-lg border transition-colors focus-ring ${
                isFavorite
                  ? 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50`}
              title={isFavorite ? 'Remover de favoritos' : 'Agregar a favoritos'}
            >
              <HeartIcon className="w-4 h-4" filled={isFavorite} />
            </button>

            {/* Category button */}
            <button
              onClick={handleCategoryClick}
              className="p-2 rounded-lg border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors focus-ring"
              title="Gestionar categorías"
            >
              <TagIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCategoryModalConfirm}
        cocktailId={id}
        cocktailName={nombre}
      />
    </>
  );
}

export default CoctelCard;
