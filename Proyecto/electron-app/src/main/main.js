import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Utilities
import Logger from './utils/logger.js';

// Database setup
import { initializeDatabase } from './db/config/database.js';

// Repositories
import {
  categoryRepository,
  cocktailRepository,
  favoriteRepository,
  // ingredientRepository,
  // notificationRepository,
  recipeRepository,
  // userRepository,
} from './db/repositories/index.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logger
const logger = new Logger('Main');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    // Abrir DevTools automáticamente en desarrollo
    win.webContents.openDevTools();
  } else {
    win.loadFile('dist/renderer/index.html');
  }
}

app.whenReady().then(() => {
  // Inicializar base de datos
  initializeDatabase();

  // Crear ventana principal
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

logger.info('ZFCocteles iniciado correctamente 🥂');

// Canales IPC para gestión de cócteles
ipcMain.on('guardar-coctel', (event, coctel) => {
  try {
    const id = cocktailRepository.createComplete(coctel);
    event.reply('guardar-coctel-respuesta', { success: true, id });
  } catch (error) {
    event.reply('guardar-coctel-respuesta', { success: false, error: error.message });
  }
});

ipcMain.handle('obtener-cocteles', async () => {
  try {
    return { success: true, data: cocktailRepository.findAllWithBasicInfo() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-coctel', async (event, id) => {
  try {
    // Validación de entrada
    if (!id || isNaN(parseInt(id))) {
      return { success: false, error: 'ID de cóctel inválido' };
    }
    const cocktailId = parseInt(id);

    const coctel = cocktailRepository.findCompleteById(cocktailId);
    return { success: true, data: coctel };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('buscar-cocteles', async (event, nombre) => {
  try {
    const cocteles = cocktailRepository.searchByName(nombre);
    return { success: true, data: cocteles };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-estadisticas', async () => {
  try {
    const stats = cocktailRepository.getStatistics();
    return { success: true, data: stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-receta-completa', async (_event, cocktailId) => {
  try {
    // Validación de entrada
    if (!cocktailId || isNaN(parseInt(cocktailId))) {
      throw new Error('ID de cóctel inválido');
    }
    const id = parseInt(cocktailId);

    // 1) Busca la fila de recipes asociada al cóctel
    const rec = recipeRepository.findByCocktailId(id);

    if (!rec || !rec.id) {
      logger.warn(`⚠️ No existe receta para cocktailId=${id}`);
      return null;
    }

    // 2) Con ese recipe.id, trae los detalles básicos (ingredientes, pasos, etc.)
    const complete = await recipeRepository.getComplete(rec.id);

    if (!complete) {
      return null;
    }

    // 3) Enriquecer con difficulty (de cocktails) y duration total (suma de recipe_steps)
    const difficulty = cocktailRepository.getDifficulty(id);
    const totalDuration = cocktailRepository.getTotalDuration(id);

    // 4) Devolver un único objeto con todo
    const result = {
      ...complete,
      difficulty,
      preparation_time: totalDuration,
    };

    return result;
  } catch (err) {
    logger.error('Error en handler obtener-receta-completa:', err);
    throw err;
  }
});

// ========== HANDLERS IPC PARA FAVORITOS ==========

ipcMain.handle('obtener-favoritos', async (event, userId) => {
  try {
    const favorites = favoriteRepository.findByUserId(userId);
    return { success: true, data: favorites };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('es-favorito', async (event, userId, cocktailId) => {
  try {
    const isFav = favoriteRepository.isFavorite(userId, cocktailId);
    return { success: true, data: isFav };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('toggle-favorito', async (event, userId, cocktailId) => {
  try {
    const result = favoriteRepository.toggleFavorite(userId, cocktailId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('agregar-favorito', async (event, userId, cocktailId) => {
  try {
    const result = favoriteRepository.addFavorite(userId, cocktailId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('remover-favorito', async (event, userId, cocktailId) => {
  try {
    const result = favoriteRepository.removeFavorite(userId, cocktailId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========== HANDLERS IPC PARA CATEGORÍAS ==========

ipcMain.handle('obtener-categorias', async () => {
  try {
    const categories = categoryRepository.findAll();
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-categorias-del-sistema', async () => {
  try {
    const categories = categoryRepository.findSystemCategories();
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-categorias-del-usuario', async (event, userId) => {
  try {
    const categories = categoryRepository.findUserCategories(userId);
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('crear-categoria', async (event, categoryData) => {
  try {
    const result = categoryRepository.createCategory(categoryData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-cocteles-de-categoria', async (event, categoryId) => {
  try {
    const cocktails = categoryRepository.getCocktails(categoryId);
    return { success: true, data: cocktails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('agregar-coctel-a-categoria', async (event, cocktailId, categoryId) => {
  try {
    const result = cocktailRepository.addToCategory(cocktailId, categoryId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('remover-coctel-de-categoria', async (event, cocktailId, categoryId) => {
  try {
    const result = cocktailRepository.removeFromCategory(cocktailId, categoryId);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-categorias-del-coctel', async (event, cocktailId) => {
  try {
    const categories = cocktailRepository.getCategoriesForCocktail(cocktailId);
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========== HANDLERS IPC PARA BÚSQUEDA AVANZADA ==========

ipcMain.handle('buscar-cocteles-con-filtros', async (event, filters) => {
  try {
    const cocktails = cocktailRepository.searchWithFilters(filters);
    return { success: true, data: cocktails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('buscar-cocteles-por-ingredientes', async (event, ingredients) => {
  try {
    const cocktails = cocktailRepository.findByIngredients(ingredients);
    return { success: true, data: cocktails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('obtener-sugerencias-busqueda', async (event, term, limit = 10) => {
  try {
    const suggestions = cocktailRepository.getSearchSuggestions(term, limit);
    return { success: true, data: suggestions };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('busqueda-fuzzy', async (event, searchTerm) => {
  try {
    const cocktails = cocktailRepository.fuzzySearch(searchTerm);
    return { success: true, data: cocktails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('buscar-cocteles-por-dificultad', async (event, difficulty) => {
  try {
    const cocktails = cocktailRepository.findByDifficulty(difficulty);
    return { success: true, data: cocktails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('buscar-cocteles-por-categoria', async (event, categoryId) => {
  try {
    const cocktails = cocktailRepository.findByCategory(categoryId);
    return { success: true, data: cocktails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('buscar-cocteles-por-alcohol', async (event, isAlcoholic) => {
  try {
    const cocktails = cocktailRepository.findByAlcoholContent(isAlcoholic);
    return { success: true, data: cocktails };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
