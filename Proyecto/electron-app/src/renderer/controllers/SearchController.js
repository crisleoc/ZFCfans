/**
 * SearchController - Controlador para búsqueda y filtrado de cócteles
 * Actúa como intermediario entre los componentes React y el backend
 */

class SearchController {
  /**
   * Buscar cócteles con filtros múltiples
   */
  static async searchWithFilters(filters) {
    try {
      if (!filters || typeof filters !== 'object') {
        throw new Error('Filtros son requeridos');
      }

      // Verificar que electronAPI esté disponible
      if (!window.electronAPI || !window.electronAPI.buscarCoctelesConFiltros) {
        throw new Error(
          'API de búsqueda no disponible. Verifica que la aplicación esté ejecutándose en Electron.',
        );
      }

      const result = await window.electronAPI.buscarCoctelesConFiltros(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en SearchController.searchWithFilters:', error);
      throw error;
    }
  }

  /**
   * Buscar cócteles por ingredientes específicos
   */
  static async searchByIngredients(ingredients) {
    try {
      if (!Array.isArray(ingredients)) {
        throw new Error('Ingredientes debe ser un array');
      }

      const result = await window.electronAPI.buscarCoctelesPorIngredientes(ingredients);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en SearchController.searchByIngredients:', error);
      throw error;
    }
  }

  /**
   * Obtener sugerencias de autocompletar
   */
  static async getSearchSuggestions(term, limit = 10) {
    try {
      if (!term || typeof term !== 'string') {
        return [];
      }

      const result = await window.electronAPI.obtenerSugerenciasBusqueda(term, limit);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en SearchController.getSearchSuggestions:', error);
      return [];
    }
  }

  /**
   * Búsqueda fuzzy (tolerante a errores)
   */
  static async fuzzySearch(searchTerm) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        throw new Error('Término de búsqueda es requerido');
      }

      const result = await window.electronAPI.busquedaFuzzy(searchTerm);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en SearchController.fuzzySearch:', error);
      throw error;
    }
  }

  /**
   * Buscar cócteles por dificultad
   */
  static async searchByDifficulty(difficulty) {
    try {
      if (!difficulty) {
        throw new Error('Dificultad es requerida');
      }

      const result = await window.electronAPI.buscarCoctelesPorDificultad(difficulty);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en SearchController.searchByDifficulty:', error);
      throw error;
    }
  }

  /**
   * Buscar cócteles por categoría
   */
  static async searchByCategory(categoryId) {
    try {
      if (!categoryId) {
        throw new Error('Category ID es requerido');
      }

      const result = await window.electronAPI.buscarCoctelesPorCategoria(categoryId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en SearchController.searchByCategory:', error);
      throw error;
    }
  }

  /**
   * Buscar cócteles por contenido alcohólico
   */
  static async searchByAlcohol(isAlcoholic) {
    try {
      if (typeof isAlcoholic !== 'boolean') {
        throw new Error('isAlcoholic debe ser un booleano');
      }

      const result = await window.electronAPI.buscarCoctelesPorAlcohol(isAlcoholic);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en SearchController.searchByAlcohol:', error);
      throw error;
    }
  }

  /**
   * Validar filtros antes de enviar
   */
  static validateFilters(filters) {
    const validFilters = {};

    // Validar término de búsqueda
    if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
      validFilters.search = filters.search.trim();
    }

    // Validar dificultad
    const validDifficulties = [
      'muy fácil',
      'muy facil',
      'fácil',
      'facil',
      'media',
      'difícil',
      'dificil',
      'muy difícil',
      'muy dificil',
    ];
    if (filters.difficulty && validDifficulties.includes(filters.difficulty.toLowerCase())) {
      validFilters.difficulty = filters.difficulty;
    }

    // Validar categoría
    if (filters.category && typeof filters.category === 'string' && filters.category.trim()) {
      validFilters.category = filters.category.trim();
    }

    // Validar ingredientes
    if (Array.isArray(filters.ingredients) && filters.ingredients.length > 0) {
      validFilters.ingredients = filters.ingredients.filter(
        ingredient => ingredient && typeof ingredient === 'string' && ingredient.trim(),
      );
    }

    // Validar contenido alcohólico
    if (typeof filters.isAlcoholic === 'boolean') {
      validFilters.isAlcoholic = filters.isAlcoholic;
    }

    // Validar ordenamiento
    const validSortFields = ['name', 'difficulty', 'preparation_time', 'is_alcoholic'];
    if (filters.sortBy && validSortFields.includes(filters.sortBy)) {
      validFilters.sortBy = filters.sortBy;
    }

    const validSortOrders = ['ASC', 'DESC'];
    if (filters.sortOrder && validSortOrders.includes(filters.sortOrder.toUpperCase())) {
      validFilters.sortOrder = filters.sortOrder.toUpperCase();
    }

    return validFilters;
  }

  /**
   * Construir objeto de filtros a partir de parámetros de UI
   */
  static buildFiltersFromUI(
    searchTerm,
    selectedDifficulty,
    selectedCategory,
    isAlcoholic,
    sortBy,
    sortOrder,
  ) {
    return this.validateFilters({
      search: searchTerm,
      difficulty: selectedDifficulty,
      category: selectedCategory,
      isAlcoholic,
      sortBy,
      sortOrder,
    });
  }
}

export default SearchController;
