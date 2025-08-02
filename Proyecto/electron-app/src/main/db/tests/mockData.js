import { vi } from 'vitest';

/**
 * Datos mock compartidos para todos los tests de repositorios
 */

// Datos base para usuarios
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@zfcfans.com',
    password: 'admin_password',
    created_at: '2025-01-01 10:00:00',
  },
  {
    id: 2,
    username: 'bartender_pro',
    email: 'bartender@example.com',
    password: 'bartender_pass',
    created_at: '2025-01-02 15:30:00',
  },
  {
    id: 3,
    username: 'cocktail_lover',
    email: 'lover@cocktails.com',
    password: 'love_cocktails',
    created_at: '2025-01-03 20:15:00',
  },
];

// Datos base para categorías
export const mockCategories = [
  {
    id: 1,
    name: 'Favoritos',
    description: 'Categoría del sistema para cócteles favoritos',
    color: '#FF6B6B',
    is_system: 1,
    id_owner: null,
  },
  {
    id: 2,
    name: 'Aperitivos',
    description: 'Cócteles para abrir el apetito',
    color: '#4ECDC4',
    is_system: 0,
    id_owner: 1,
  },
  {
    id: 3,
    name: 'Digestivos',
    description: 'Cócteles para después de la comida',
    color: '#45B7D1',
    is_system: 0,
    id_owner: 1,
  },
  {
    id: 4,
    name: 'Dulces',
    description: 'Cócteles con sabor dulce',
    color: '#F7DC6F',
    is_system: 0,
    id_owner: 2,
  },
];

// Datos base para ingredientes
export const mockIngredients = [
  {
    id: 1,
    name: 'Ron blanco',
    description: 'Ron claro destilado',
    unit_type: 'ml',
    alcohol_content: 40.0,
    created_at: '2025-01-01 10:00:00',
  },
  {
    id: 2,
    name: 'Vodka',
    description: 'Vodka premium',
    unit_type: 'ml',
    alcohol_content: 40.0,
    created_at: '2025-01-01 10:00:00',
  },
  {
    id: 3,
    name: 'Zumo de lima',
    description: 'Jugo fresco de lima',
    unit_type: 'ml',
    alcohol_content: 0.0,
    created_at: '2025-01-01 10:00:00',
  },
  {
    id: 4,
    name: 'Azúcar',
    description: 'Azúcar blanca refinada',
    unit_type: 'g',
    alcohol_content: 0.0,
    created_at: '2025-01-01 10:00:00',
  },
  {
    id: 5,
    name: 'Menta fresca',
    description: 'Hojas de menta frescas',
    unit_type: 'hojas',
    alcohol_content: 0.0,
    created_at: '2025-01-01 10:00:00',
  },
];

// Datos base para cócteles
export const mockCocktails = [
  {
    id: 1,
    name: 'Mojito Clásico',
    description: 'El clásico cóctel cubano con menta y lima',
    difficulty: 'fácil',
    preparation_time: 5,
    servings: 1,
    alcohol_content: 12.5,
    glass_type: 'highball',
    is_alcoholic: 1,
    img_url: 'https://example.com/mojito.jpg',
    id_creator: 1,
    id_pairing: 1,
    created_at: '2025-01-01 12:00:00',
  },
  {
    id: 2,
    name: 'Moscow Mule',
    description: 'Cóctel refrescante con vodka y ginger beer',
    difficulty: 'fácil',
    preparation_time: 3,
    servings: 1,
    alcohol_content: 15.0,
    glass_type: 'copper_mug',
    is_alcoholic: 1,
    img_url: 'https://example.com/moscow_mule.jpg',
    id_creator: 2,
    id_pairing: 1,
    created_at: '2025-01-02 14:30:00',
  },
  {
    id: 3,
    name: 'Virgin Mojito',
    description: 'Mojito sin alcohol, perfecto para cualquier momento',
    difficulty: 'fácil',
    preparation_time: 4,
    servings: 1,
    alcohol_content: 0.0,
    glass_type: 'highball',
    is_alcoholic: 0,
    img_url: 'https://example.com/virgin_mojito.jpg',
    id_creator: 3,
    id_pairing: 2,
    created_at: '2025-01-03 16:45:00',
  },
  {
    id: 4,
    name: 'Agua con Gas y Limón',
    description: 'Bebida refrescante muy simple',
    difficulty: 'muy fácil',
    preparation_time: 1,
    servings: 1,
    alcohol_content: 0.0,
    glass_type: 'highball',
    is_alcoholic: 0,
    img_url: 'https://example.com/agua_limon.jpg',
    id_creator: 1,
    id_pairing: 3,
    created_at: '2025-01-04 09:15:00',
  },
  {
    id: 5,
    name: 'Margarita Clásica',
    description: 'Cóctel mexicano que requiere técnica moderada',
    difficulty: 'media',
    preparation_time: 7,
    servings: 1,
    alcohol_content: 20.0,
    glass_type: 'margarita',
    is_alcoholic: 1,
    img_url: 'https://example.com/margarita.jpg',
    id_creator: 1,
    id_pairing: 3,
    created_at: '2025-01-05 18:00:00',
  },
  {
    id: 6,
    name: 'Negroni',
    description: 'Cóctel italiano con técnicas de mezclado específicas',
    difficulty: 'difícil',
    preparation_time: 5,
    servings: 1,
    alcohol_content: 25.0,
    glass_type: 'rocks',
    is_alcoholic: 1,
    img_url: 'https://example.com/negroni.jpg',
    id_creator: 2,
    id_pairing: 1,
    created_at: '2025-01-06 19:30:00',
  },
  {
    id: 7,
    name: 'Ramos Gin Fizz',
    description: 'Cóctel clásico que requiere técnica avanzada de batido',
    difficulty: 'muy difícil',
    preparation_time: 15,
    servings: 1,
    alcohol_content: 22.0,
    glass_type: 'collins',
    is_alcoholic: 1,
    img_url: 'https://example.com/ramos_gin_fizz.jpg',
    id_creator: 2,
    id_pairing: 4,
    created_at: '2025-01-07 20:30:00',
  },
];

// Datos base para notificaciones
export const mockNotifications = [
  {
    id: 1,
    id_user: 1,
    type: 'logro',
    title: 'Primer cóctel creado',
    message: '¡Felicidades! Has creado tu primer cóctel',
    is_read: 0,
    is_system: 1,
    related_cocktail_id: 1,
    created_at: '2025-01-01 12:30:00',
    read_at: null,
  },
  {
    id: 2,
    id_user: 2,
    type: 'recordatorio',
    title: 'Tiempo de preparar cócteles',
    message: 'Es hora de preparar algunos cócteles deliciosos',
    is_read: 1,
    is_system: 0,
    related_cocktail_id: null,
    created_at: '2025-01-02 18:00:00',
    read_at: '2025-01-02 18:15:00',
  },
];

// Relaciones many-to-many
export const mockCocktailCategories = [
  { id: 1, id_cocktail: 1, id_category: 2 }, // Mojito -> Aperitivos
  { id: 2, id_cocktail: 1, id_category: 1 }, // Mojito -> Favoritos
  { id: 3, id_cocktail: 2, id_category: 2 }, // Moscow Mule -> Aperitivos
];

// Datos base para recipes
export const mockRecipes = [
  {
    id: 1,
    id_cocktail: 1,
    glass_type: 'highball',
    garnish: 'Hojas de menta fresca',
    serving_suggestion: 'Servir con hielo picado',
    created_at: '2025-01-01 12:00:00',
  },
  {
    id: 2,
    id_cocktail: 2,
    glass_type: 'copper_mug',
    garnish: 'Rodaja de lima',
    serving_suggestion: 'Servir muy frío',
    created_at: '2025-01-02 14:30:00',
  },
  {
    id: 3,
    id_cocktail: 3,
    glass_type: 'highball',
    garnish: 'Menta y lima',
    serving_suggestion: 'Perfecto para el verano',
    created_at: '2025-01-03 16:45:00',
  },
];

// Datos base para recipe_ingredients
export const mockRecipeIngredients = [
  {
    id: 1,
    id_recipe: 1,
    id_ingredient: 1,
    quantity: 50,
    unit: 'ml',
    preparation_note: 'Ron blanco de buena calidad',
    is_optional: 0,
    order_index: 1,
  },
  {
    id: 2,
    id_recipe: 1,
    id_ingredient: 3,
    quantity: 30,
    unit: 'ml',
    preparation_note: 'Jugo fresco',
    is_optional: 0,
    order_index: 2,
  },
  {
    id: 3,
    id_recipe: 1,
    id_ingredient: 5,
    quantity: 8,
    unit: 'hojas',
    preparation_note: 'Machacar suavemente',
    is_optional: 0,
    order_index: 3,
  },
  {
    id: 4,
    id_recipe: 2,
    id_ingredient: 2,
    quantity: 60,
    unit: 'ml',
    preparation_note: 'Vodka premium',
    is_optional: 0,
    order_index: 1,
  },
];

// Datos base para pairings
export const mockPairings = [
  {
    id: 1,
    name: 'Mariscos',
    description: 'Perfecto con mariscos frescos',
    category: 'Proteína',
    created_at: '2025-01-01 10:00:00',
  },
  {
    id: 2,
    name: 'Frutas',
    description: 'Ideal con frutas tropicales',
    category: 'Dulce',
    created_at: '2025-01-01 10:00:00',
  },
];

/**
 * Crea un mock de base de datos con datos predefinidos
 */
export function createMockDatabase() {
  const mockDb = {
    exec: vi.fn(),
    close: vi.fn(),
    prepare: vi.fn(),
  };

  // Configurar diferentes tipos de statements
  const createMockStatement = data => ({
    run: vi.fn(() => ({
      lastInsertRowid: 4, // Valor fijo que esperan los tests
      changes: 1,
    })),
    get: vi.fn(id => {
      if (typeof id === 'number') {
        return data.find(item => item.id === id) || null;
      }
      return data[0] || { count: data.length };
    }),
    all: vi.fn(() => data),
  });

  // Configuración por defecto del mock (se puede sobrescribir en tests individuales)
  mockDb.prepare.mockImplementation(query => {
    const normalizedQuery = query.toLowerCase().trim();

    // Users
    if (normalizedQuery.includes('users')) {
      return createMockStatement(mockUsers);
    }

    // Categories
    if (normalizedQuery.includes('categories')) {
      if (normalizedQuery.includes('is_system = 1')) {
        return createMockStatement(mockCategories.filter(c => c.is_system === 1));
      }
      if (normalizedQuery.includes('is_system = 0')) {
        return createMockStatement(mockCategories.filter(c => c.is_system === 0));
      }
      return createMockStatement(mockCategories);
    }

    // Cocktails - consultas estadísticas específicas
    if (
      normalizedQuery.includes('count(*) as count from cocktails') &&
      normalizedQuery.includes('group by difficulty')
    ) {
      const stats = [
        { difficulty: 'muy fácil', count: 1 },
        { difficulty: 'fácil', count: 2 },
        { difficulty: 'media', count: 1 },
        { difficulty: 'difícil', count: 1 },
        { difficulty: 'muy difícil', count: 1 },
      ];
      return createMockStatement(stats);
    }

    if (
      normalizedQuery.includes('count(*) as count from cocktails') &&
      normalizedQuery.includes('alcohol_content > 0')
    ) {
      return {
        get: vi.fn(() => ({ count: 5 })),
        all: vi.fn(() => []),
        run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
      };
    }

    if (
      normalizedQuery.includes('count(*) as count from cocktails') &&
      normalizedQuery.includes('is_featured = 1')
    ) {
      return {
        get: vi.fn(() => ({ count: 1 })),
        all: vi.fn(() => []),
        run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
      };
    }

    if (
      normalizedQuery.includes('count(*) as count from cocktails') &&
      !normalizedQuery.includes('where')
    ) {
      return {
        get: vi.fn(() => ({ count: mockCocktails.length })),
        all: vi.fn(() => []),
        run: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
      };
    }

    // Cocktail Categories - INSERT específico (DEBE IR ANTES que la condición general de cocktails)
    if (normalizedQuery.includes('insert') && normalizedQuery.includes('cocktail_categories')) {
      return {
        run: vi.fn(() => ({
          lastInsertRowid: 4,
          changes: 1,
        })),
        get: vi.fn(() => null),
        all: vi.fn(() => []),
      };
    }

    // Cocktail Categories (relaciones) - consultas SELECT (DEBE IR ANTES que la condición general de cocktails)
    if (normalizedQuery.includes('cocktail_categories')) {
      return {
        run: vi.fn(() => ({
          lastInsertRowid: 4,
          changes: 1,
        })),
        get: vi.fn(id => {
          if (typeof id === 'number') {
            return mockCocktailCategories.find(item => item.id === id) || null;
          }
          return mockCocktailCategories[0] || { count: mockCocktailCategories.length };
        }),
        all: vi.fn(() => mockCocktailCategories),
      };
    }

    // Cocktails - consultas generales
    if (normalizedQuery.includes('cocktails')) {
      return createMockStatement(mockCocktails);
    }

    // Ingredients
    if (normalizedQuery.includes('ingredients')) {
      return createMockStatement(mockIngredients);
    }

    // Notifications
    if (normalizedQuery.includes('notifications')) {
      return createMockStatement(mockNotifications);
    }

    // Recipes
    if (normalizedQuery.includes('from recipes')) {
      return createMockStatement(mockRecipes);
    }

    // Recipe Ingredients
    if (normalizedQuery.includes('from recipe_ingredients')) {
      return createMockStatement(mockRecipeIngredients);
    }

    // Pairings
    if (normalizedQuery.includes('from pairings')) {
      return createMockStatement(mockPairings);
    }

    // Consultas de tabla master (schema)
    if (normalizedQuery.includes('sqlite_master')) {
      const tables = [
        { name: 'users' },
        { name: 'categories' },
        { name: 'cocktails' },
        { name: 'ingredients' },
        { name: 'notifications' },
        { name: 'cocktail_categories' },
        { name: 'recipes' },
        { name: 'recipe_ingredients' },
        { name: 'pairings' },
      ];
      return createMockStatement(tables);
    }

    // Default mock statement
    return createMockStatement([]);
  });

  return mockDb;
}

// Mock del módulo database.js para evitar dependencias de Electron
vi.mock('../config/database.js', () => ({
  getDb: vi.fn(() => createMockDatabase()),
  getDatabase: vi.fn(() => createMockDatabase()),
  initDb: vi.fn(),
  closeDb: vi.fn(),
}));

// Mock del módulo better-sqlite3
vi.mock('better-sqlite3', () => ({
  default: vi.fn(() => createMockDatabase()),
}));

/**
 * Función para hacer mock de better-sqlite3 (compatibilidad con archivos antiguos)
 */
export function mockBetterSqlite3() {
  // Esta función ya no es necesaria porque el mock se hace automáticamente
  // Se mantiene solo para compatibilidad con tests existentes
}
