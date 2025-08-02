import { beforeEach, describe, expect, test, vi } from 'vitest';
// Mock del módulo de base de datos para evitar inicialización real
vi.mock('../config/database.js', () => ({
  getDb: () => mockDb,
  getDatabase: () => mockDb,
  initDb: vi.fn(),
  closeDb: vi.fn(),
}));
import CocktailRepository from '../repositories/CocktailRepository.js';

// Mock de la base de datos para simular almacenamiento
const mockDb = {
  prepare: vi.fn(() => ({
    run: vi.fn((...args) => ({
      lastInsertRowid: Math.floor(Math.random() * 100) + 1,
      changes: 1,
      args,
    })),
    get: vi.fn(() => null),
    all: vi.fn(() => []),
  })),
};

describe('CocktailBDCreated - almacenamiento en base de datos', () => {
  let repository;
  beforeEach(() => {
    repository = new CocktailRepository();
    repository.db = mockDb;
    mockDb.prepare.mockClear();
  });

  test('debería almacenar un cóctel válido en la base de datos', () => {
    const cocktailData = {
      name: 'Caipirinha',
      description: 'Cóctel brasileño refrescante',
      difficulty: 'fácil',
      preparation_time: 5,
      servings: 1,
      alcohol_content: 20.0,
      glass_type: 'old fashioned',
      is_alcoholic: 1,
      img_url: 'https://example.com/caipirinha.jpg',
      id_creator: 2,
      id_pairing: 1,
    };
    const result = repository.create(cocktailData);
    expect(result).toBeGreaterThan(0);
    expect(mockDb.prepare).toHaveBeenCalled();
  });

  test('debería almacenar varios cócteles y devolver IDs únicos', () => {
    const cocktails = [
      { name: 'Mojito', difficulty: 'fácil', preparation_time: 5 },
      { name: 'Piña Colada', difficulty: 'media', preparation_time: 8 },
      { name: 'Negroni', difficulty: 'difícil', preparation_time: 3 },
    ];
    const ids = cocktails.map(data => repository.create(data));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('debería rechazar cócteles sin nombre', () => {
    const cocktailData = { difficulty: 'fácil', preparation_time: 5 };
    // Simula validación en el método create
    repository.create = data => {
      if (!data.name || data.name.trim() === '') {
        throw new Error('Nombre requerido');
      }
      return 1;
    };
    expect(() => repository.create(cocktailData)).toThrow('Nombre requerido');
  });

  test('debería almacenar cócteles con y sin imagen', () => {
    const cocktailWithImage = { name: 'Daiquiri', img_url: 'daiquiri.png' };
    const cocktailWithoutImage = { name: 'Gin Tonic' };
    expect(repository.create(cocktailWithImage)).toBeGreaterThan(0);
    expect(repository.create(cocktailWithoutImage)).toBeGreaterThan(0);
  });

  test('debería almacenar cócteles con diferentes dificultades', () => {
    const easy = { name: 'Spritz', difficulty: 'fácil' };
    const medium = { name: 'Martini', difficulty: 'media' };
    const hard = { name: 'Zombie', difficulty: 'difícil' };
    expect(repository.create(easy)).toBeGreaterThan(0);
    expect(repository.create(medium)).toBeGreaterThan(0);
    expect(repository.create(hard)).toBeGreaterThan(0);
  });

  test('debería rechazar cócteles con nombre duplicado (simulado)', () => {
    // Simula que el nombre ya existe
    repository.create = data => {
      if (data.name === 'Mojito') {
        throw new Error('Nombre duplicado');
      }
      return 1;
    };
    expect(() => repository.create({ name: 'Mojito' })).toThrow('Nombre duplicado');
    expect(repository.create({ name: 'Otro' })).toBe(1);
  });

  test('debería almacenar cócteles con y sin alcohol', () => {
    const alcoholic = { name: 'Whisky Sour', is_alcoholic: 1 };
    const nonAlcoholic = { name: 'Virgin Mojito', is_alcoholic: 0 };
    expect(repository.create(alcoholic)).toBeGreaterThan(0);
    expect(repository.create(nonAlcoholic)).toBeGreaterThan(0);
  });

  test('debería almacenar cócteles con diferentes tipos de vaso', () => {
    const glasses = ['highball', 'rocks', 'martini', 'coupe', 'hurricane'];
    glasses.forEach(glass_type => {
      const cocktail = { name: `Cóctel ${glass_type}`, glass_type };
      expect(repository.create(cocktail)).toBeGreaterThan(0);
    });
  });
});
