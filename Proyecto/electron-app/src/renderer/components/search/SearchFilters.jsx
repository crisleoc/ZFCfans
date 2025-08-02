import { useCallback, useEffect, useState } from 'react';
import { CloseIcon, FilterIcon } from '../icons/Icons';
import FilterDropdown from '../common/FilterDropdown';
import CategoryController from '../../controllers/CategoryController';

function SearchFilters({ onFiltersChange, onClear, className = '', initialFilters = {} }) {
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    isAlcoholic: '',
    sortBy: '',
    sortOrder: '',
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Opciones para los filtros
  const difficultyOptions = [
    { value: 'muy fácil', label: 'Muy Fácil' },
    { value: 'fácil', label: 'Fácil' },
    { value: 'media', label: 'Media' },
    { value: 'difícil', label: 'Difícil' },
    { value: 'muy difícil', label: 'Muy Difícil' },
  ];

  // Cargar categorías desde la base de datos
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const categories = await CategoryController.getAll();

        // Filtrar categorías que no sean "Favoritos" y formatear para el dropdown
        const formattedCategories = categories
          .filter(cat => cat.name !== 'Favoritos')
          .map(cat => ({
            value: cat.name.toLowerCase(),
            label: cat.name,
            isSystem: cat.is_system || false,
            color: cat.color || null,
          }))
          .sort((a, b) => {
            // Primero las categorías del sistema, luego las personalizadas
            if (a.isSystem && !b.isSystem) {
              return -1;
            }
            if (!a.isSystem && b.isSystem) {
              return 1;
            }
            return a.label.localeCompare(b.label);
          });

        // eslint-disable-next-line no-console
        console.log('✅ Categorías formateadas:', formattedCategories);
        setCategoryOptions(formattedCategories);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Error loading categories:', error);
        setCategoryOptions([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const alcoholOptions = [
    { value: 'true', label: 'Con Alcohol' },
    { value: 'false', label: 'Sin Alcohol' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'difficulty', label: 'Dificultad' },
    { value: 'preparation_time', label: 'Tiempo de preparación' },
  ];

  const sortOrderOptions = [
    { value: 'ASC', label: 'Ascendente' },
    { value: 'DESC', label: 'Descendente' },
  ];

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterName]: value,
      };

      // Convertir isAlcoholic string a boolean si necesario
      if (filterName === 'isAlcoholic' && value !== '') {
        newFilters.isAlcoholic = value === 'true';
      } else if (filterName === 'isAlcoholic' && value === '') {
        delete newFilters.isAlcoholic;
      }

      return newFilters;
    });
  }, []);

  // Notificar cambios al componente padre
  useEffect(() => {
    if (onFiltersChange) {
      // Filtrar valores vacíos antes de enviar
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== '' && value !== null && value !== undefined,
        ),
      );
      onFiltersChange(cleanFilters);
    }
  }, [filters, onFiltersChange]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      difficulty: '',
      category: '',
      isAlcoholic: '',
      sortBy: '',
      sortOrder: '',
    };
    setFilters(clearedFilters);

    if (onClear) {
      onClear();
    }
  }, [onClear]);

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.entries(filters).some(([_key, value]) => {
    return value !== '' && value !== null && value !== undefined;
  });

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showAdvanced ? 'Menos' : 'Más'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 transition-colors flex items-center space-x-1"
            >
              <CloseIcon className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        <FilterDropdown
          placeholder="Dificultad"
          options={difficultyOptions}
          value={filters.difficulty}
          onChange={value => handleFilterChange('difficulty', value)}
        />

        <FilterDropdown
          placeholder={loadingCategories ? 'Cargando categorías...' : 'Categoría'}
          options={categoryOptions}
          value={filters.category}
          onChange={value => handleFilterChange('category', value)}
          disabled={loadingCategories}
          showColors={true}
          showSystemBadges={true}
        />

        <FilterDropdown
          placeholder="Contenido alcohólico"
          options={alcoholOptions}
          value={
            filters.isAlcoholic === true ? 'true' : filters.isAlcoholic === false ? 'false' : ''
          }
          onChange={value => handleFilterChange('isAlcoholic', value)}
        />
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <FilterDropdown
              placeholder="Ordenar por"
              options={sortOptions}
              value={filters.sortBy}
              onChange={value => handleFilterChange('sortBy', value)}
            />

            <FilterDropdown
              placeholder="Orden"
              options={sortOrderOptions}
              value={filters.sortOrder}
              onChange={value => handleFilterChange('sortOrder', value)}
            />
          </div>
        </div>
      )}

      {/* Información de resultados */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <strong>Filtros activos:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.difficulty && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  Dificultad: {filters.difficulty}
                </span>
              )}
              {filters.category && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  Categoría: {filters.category}
                </span>
              )}
              {typeof filters.isAlcoholic === 'boolean' && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {filters.isAlcoholic ? 'Con alcohol' : 'Sin alcohol'}
                </span>
              )}
              {filters.sortBy && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  Orden: {sortOptions.find(opt => opt.value === filters.sortBy)?.label}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFilters;
