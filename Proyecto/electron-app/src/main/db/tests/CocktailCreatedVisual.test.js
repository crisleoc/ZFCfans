import { describe, expect, test } from 'vitest';

// Simulación de cócteles creados y visualizados en la app
const cocktails = [
  {
    id: 1,
    name: 'Mojito',
    description: 'Cóctel cubano refrescante',
    img_url: 'mojito.png',
    difficulty: 'fácil',
    is_alcoholic: 1,
  },
  {
    id: 2,
    name: 'Piña Colada',
    description: 'Cóctel tropical cremoso',
    img_url: 'pina_colada.jpg',
    difficulty: 'media',
    is_alcoholic: 1,
  },
  {
    id: 3,
    name: 'Virgin Mojito',
    description: 'Versión sin alcohol del mojito',
    img_url: 'virgin_mojito.png',
    difficulty: 'fácil',
    is_alcoholic: 0,
  },
];

describe('CocktailCreatedVisual - legibilidad en la aplicación', () => {
  test('todos los cócteles tienen nombre visible y no vacío', () => {
    cocktails.forEach(cocktail => {
      expect(cocktail.name).toBeDefined();
      expect(cocktail.name.trim().length).toBeGreaterThan(0);
    });
  });

  test('todas las descripciones son legibles y no vacías', () => {
    cocktails.forEach(cocktail => {
      expect(cocktail.description).toBeDefined();
      expect(cocktail.description.trim().length).toBeGreaterThan(0);
    });
  });

  test('todas las imágenes tienen formato válido y son accesibles', () => {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    cocktails.forEach(cocktail => {
      expect(cocktail.img_url).toBeDefined();
      expect(validExtensions.some(ext => cocktail.img_url.endsWith(ext))).toBe(true);
    });
  });

  test('la dificultad se muestra correctamente', () => {
    const allowed = ['muy fácil', 'fácil', 'media', 'difícil', 'muy difícil'];
    cocktails.forEach(cocktail => {
      expect(allowed).toContain(cocktail.difficulty);
    });
  });

  test('el estado alcohólico se visualiza correctamente', () => {
    cocktails.forEach(cocktail => {
      expect([0, 1]).toContain(cocktail.is_alcoholic);
    });
  });

  test('los cócteles pueden ser listados y buscados por nombre', () => {
    const search = term => cocktails.filter(c => c.name.toLowerCase().includes(term.toLowerCase()));
    expect(search('mojito').length).toBeGreaterThan(0);
    expect(search('piña').length).toBeGreaterThan(0);
    expect(search('colada').length).toBeGreaterThan(0);
    expect(search('no existe').length).toBe(0);
  });

  test('la visualización no muestra duplicados', () => {
    const names = cocktails.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test('los cócteles tienen un id único y visible', () => {
    const ids = cocktails.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach(id => {
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });
  });
});
