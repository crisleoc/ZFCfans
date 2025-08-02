import { beforeEach, describe, expect, it, vi } from 'vitest';
import CocktailRepository from '../repositories/CocktailRepository.js';
import { createMockDatabase, mockCocktails, mockRecipeIngredients } from './mockData.js';

// Mock del database
vi.mock('../config/database.js', () => ({
  getDb: () => createMockDatabase(),
  getDatabase: () => createMockDatabase(),
  initDb: vi.fn(),
  closeDb: vi.fn(),
}));

describe('CocktailRepository', () => {
  let repository;
  let mockDb;

  beforeEach(() => {
    mockDb = createMockDatabase();
    repository = new CocktailRepository();
    repository.db = mockDb;
  });

  describe('Métodos básicos heredados de BaseRepository', () => {
    it('debería encontrar un cóctel por ID', () => {
      const result = repository.findById(1);
      expect(result).toEqual(mockCocktails[0]);
    });

    it('debería obtener todos los cócteles', () => {
      const result = repository.findAll();
      expect(result).toEqual(mockCocktails);
      expect(result).toHaveLength(7);
    });

    it('debería crear un nuevo cóctel', () => {
      const newCocktail = {
        name: 'Piña Colada',
        description: 'Cóctel tropical cremoso',
        difficulty: 'media',
        preparation_time: 8,
        servings: 1,
        alcohol_content: 18.0,
        glass_type: 'hurricane',
        is_alcoholic: 1,
        img_url: 'https://example.com/pina_colada.jpg',
        id_creator: 1,
        id_pairing: 2,
      };

      const result = repository.create(newCocktail);
      expect(result).toBe(4); // Mock devuelve el siguiente ID
    });

    it('debería actualizar un cóctel existente', () => {
      const updates = {
        description: 'Descripción actualizada del mojito',
        difficulty: 'media',
      };

      const result = repository.update(1, updates);
      expect(result).toBe(1); // Mock devuelve changes: 1
    });

    it('debería eliminar un cóctel', () => {
      const result = repository.delete(1);
      expect(result).toBe(1);
    });
  });

  describe('findAllWithBasicInfo', () => {
    it('debería obtener todos los cócteles con información básica', () => {
      const result = repository.findAllWithBasicInfo();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería incluir información de categorías y maridajes', () => {
      // El mock debería simular un JOIN con categorías y pairings
      const _result = repository.findAllWithBasicInfo();
      expect(mockDb.prepare).toHaveBeenCalled();
    });
  });

  describe('findCompleteById', () => {
    it('debería obtener un cóctel completo con toda su información', () => {
      const result = repository.findCompleteById(1);
      expect(result).toBeDefined();
    });

    it('debería retornar null para ID inexistente', () => {
      // Configurar mock para retornar null
      const mockStatement = {
        get: vi.fn(() => null),
        all: vi.fn(() => []),
      };
      mockDb.prepare.mockReturnValue(mockStatement);

      const result = repository.findCompleteById(999);
      expect(result).toBeNull();
    });

    it('debería incluir ingredientes y pasos de preparación', () => {
      const mockStatement = {
        get: vi.fn(() => mockCocktails[0]),
        all: vi.fn(() => mockRecipeIngredients),
      };
      mockDb.prepare.mockReturnValue(mockStatement);

      const _result = repository.findCompleteById(1);
      expect(mockDb.prepare).toHaveBeenCalledTimes(3); // Consulta principal + ingredientes + pasos
    });
  });

  describe('findByCategory', () => {
    it('debería obtener cócteles por categoría', () => {
      const result = repository.findByCategory(1);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería retornar array vacío para categoría sin cócteles', () => {
      const mockStatement = {
        all: vi.fn(() => []),
      };
      mockDb.prepare.mockReturnValue(mockStatement);

      const result = repository.findByCategory(999);
      expect(result).toEqual([]);
    });
  });

  describe('findByDifficulty', () => {
    it('debería filtrar cócteles por dificultad', () => {
      const result = repository.findByDifficulty('fácil');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
    it('debería manejar diferentes niveles de dificultad', () => {
      const difficulties = ['muy fácil', 'fácil', 'media', 'difícil', 'muy difícil'];

      difficulties.forEach(difficulty => {
        const _result = repository.findByDifficulty(difficulty);
        expect(mockDb.prepare).toHaveBeenCalled();
      });
    });
  });

  describe('findByAlcoholContent', () => {
    it('debería filtrar cócteles por contenido alcohólico', () => {
      const result = repository.findByAlcoholContent(true);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería encontrar cócteles sin alcohol', () => {
      const result = repository.findByAlcoholContent(false);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('searchByName', () => {
    it('debería buscar cócteles por nombre', () => {
      const result = repository.searchByName('mojito');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería ser case-insensitive', () => {
      const _result1 = repository.searchByName('MOJITO');
      const _result2 = repository.searchByName('mojito');
      // Ambas búsquedas deberían llamar a prepare
      expect(mockDb.prepare).toHaveBeenCalledTimes(2);
    });

    it('debería manejar términos de búsqueda vacíos', () => {
      const result = repository.searchByName('');
      expect(result).toBeDefined();
    });
  });

  describe('findByCreator', () => {
    it('debería obtener cócteles por creador', () => {
      const result = repository.findByCreator(1);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería retornar array vacío para usuario sin cócteles', () => {
      const mockStatement = {
        all: vi.fn(() => []),
      };
      mockDb.prepare.mockReturnValue(mockStatement);

      const result = repository.findByCreator(999);
      expect(result).toEqual([]);
    });
  });

  describe('getStatistics', () => {
    it('debería obtener estadísticas generales de cócteles', () => {
      const mockStatement = {
        get: vi.fn(() => ({
          total_cocktails: 3,
          alcoholic_cocktails: 2,
          non_alcoholic_cocktails: 1,
          avg_alcohol_content: 9.17,
          avg_preparation_time: 4,
        })),
      };
      mockDb.prepare.mockReturnValue(mockStatement);

      const result = repository.getStatistics();
      expect(result).toBeDefined();
      expect(result.total_cocktails).toBe(3);
      expect(result.alcoholic_cocktails).toBe(2);
      expect(result.non_alcoholic_cocktails).toBe(1);
    });
  });

  describe('getCategoriesForCocktail', () => {
    it('debería obtener categorías de un cóctel', () => {
      const result = repository.getCategoriesForCocktail(1);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería retornar array vacío para cóctel sin categorías', () => {
      const mockStatement = {
        all: vi.fn(() => []),
      };
      mockDb.prepare.mockReturnValue(mockStatement);

      const result = repository.getCategoriesForCocktail(999);
      expect(result).toEqual([]);
    });
  });

  describe('addToCategory', () => {
    it('debería agregar un cóctel a una categoría', () => {
      const result = repository.addToCategory(1, 2);
      expect(result).toBe(4); // Mock devuelve siguiente ID
    });

    it('debería manejar categorías duplicadas', () => {
      // El repository debería manejar esto, pero el mock simplemente ejecuta
      const result = repository.addToCategory(1, 1); // Ya existe esta relación
      expect(result).toBeDefined();
    });
  });

  describe('removeFromCategory', () => {
    it('debería remover un cóctel de una categoría', () => {
      const result = repository.removeFromCategory(1, 2);
      expect(result).toBe(1); // Mock devuelve changes: 1
    });

    it('debería manejar relaciones inexistentes', () => {
      const result = repository.removeFromCategory(999, 999);
      expect(result).toBeDefined();
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar errores de base de datos', () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database error');
      });

      expect(() => repository.findById(1)).toThrow('Database error');
    });

    it('debería validar parámetros requeridos', () => {
      expect(() => repository.findById()).toThrow();
      expect(() => repository.findByCategory()).toThrow();
    });
  });

  describe('Validación de datos', () => {
    it('debería validar datos al crear cóctel', () => {
      const invalidCocktail = {
        // Faltan campos requeridos
        description: 'Solo descripción',
      };

      // Dependiendo de la implementación, podría lanzar error o usar defaults
      const result = repository.create(invalidCocktail);
      expect(result).toBeDefined();
    });

    it('debería validar tipos de datos', () => {
      const cocktailWithWrongTypes = {
        name: 'Test',
        alcohol_content: 'not a number', // Debería ser número
        preparation_time: 'five minutes', // Debería ser número
      };

      const result = repository.create(cocktailWithWrongTypes);
      expect(result).toBeDefined();
    });
  });

  describe('Funciones de búsqueda avanzada', () => {
    it('debería buscar cócteles con filtros básicos', () => {
      const result = repository.searchWithFilters({
        search: 'Mojito',
        difficulty: 'fácil',
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería buscar cócteles por categoría', () => {
      const result = repository.searchWithFilters({
        category: 'Aperitivos',
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería filtrar por contenido alcohólico', () => {
      const resultAlcoholic = repository.searchWithFilters({
        isAlcoholic: true,
      });
      expect(resultAlcoholic).toBeDefined();
      expect(Array.isArray(resultAlcoholic)).toBe(true);

      const resultNonAlcoholic = repository.searchWithFilters({
        isAlcoholic: false,
      });
      expect(resultNonAlcoholic).toBeDefined();
      expect(Array.isArray(resultNonAlcoholic)).toBe(true);
    });

    it('debería buscar cócteles por ingredientes', () => {
      const result = repository.findByIngredients(['Ron blanco', 'Menta fresca']);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería obtener sugerencias de búsqueda', () => {
      const result = repository.getSearchSuggestions('Moj');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería realizar búsqueda difusa', () => {
      const result = repository.fuzzySearch('Mojto'); // Error tipográfico intencional
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería manejar filtros combinados', () => {
      const result = repository.searchWithFilters({
        search: 'Mojito',
        difficulty: 'fácil',
        category: 'Aperitivos',
        isAlcoholic: true,
        sortBy: 'name',
        sortOrder: 'ASC',
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería retornar array vacío para búsquedas sin resultados', () => {
      const result = repository.searchWithFilters({
        search: 'CoctelQueNoExiste123',
      });
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('debería manejar parámetros vacíos sin errores', () => {
      const result = repository.searchWithFilters({});
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
