import BaseRepository from './BaseRepository.js';

class CocktailRepository extends BaseRepository {
  constructor() {
    super('cocktails', 'id');
  }

  /**
   * Obtener todos los cócteles con información básica
   */
  findAllWithBasicInfo() {
    const query = `
      SELECT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty AS dificultad,
        c.description AS descripcion,
        c.preparation_time AS tiempo_preparacion,
        c.alcohol_content AS contenido_alcohol,
        p.name AS maridaje,
        GROUP_CONCAT(cat.name, ', ') AS categorias,
        GROUP_CONCAT(cat.color, ', ') AS categorias_colores
      FROM cocktails c
      LEFT JOIN pairings p ON c.id_pairing = p.id
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    return this.db.prepare(query).all();
  }

  /**
   * Obtener cóctel completo por ID con ingredientes y pasos
   */
  findCompleteById(id) {
    // Información básica del cóctel con categorías incluidas
    const cocktailQuery = `
      SELECT
        c.*,
        p.name AS maridaje_nombre,
        p.description AS maridaje_descripcion,
        u.username AS creador,
        r.glass_type,
        r.garnish,
        r.serving_suggestion,
        GROUP_CONCAT(DISTINCT cat.name, ', ') AS categorias_nombres,
        GROUP_CONCAT(DISTINCT cat.color, ', ') AS categorias_colores
      FROM cocktails c
      LEFT JOIN pairings p ON c.id_pairing = p.id
      LEFT JOIN users u ON c.id_owner = u.id
      LEFT JOIN recipes r ON c.id = r.id_cocktail
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const cocktail = this.db.prepare(cocktailQuery).get(id);
    if (!cocktail) {
      return null;
    }

    // Obtener ingredientes
    const ingredientsQuery = `
      SELECT
        i.name AS nombre,
        ri.quantity AS cantidad,
        ri.unit AS unidad,
        ri.preparation_note AS nota_preparacion,
        ri.is_optional AS es_opcional,
        ri.order_index,
        i.type AS tipo,
        i.category AS categoria_ingrediente,
        i.alcohol_content AS contenido_alcohol
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.id_ingredient = i.id
      JOIN recipes r ON ri.id_recipe = r.id
      WHERE r.id_cocktail = ?
      ORDER BY ri.order_index ASC, ri.is_optional ASC
    `;

    cocktail.ingredientes = this.db.prepare(ingredientsQuery).all(id);

    // Obtener pasos de preparación
    const stepsQuery = `
      SELECT
        rs.step_number AS numero,
        rs.instruction AS instruccion,
        rs.duration AS duracion,
        rs.is_critical AS es_critico
      FROM recipe_steps rs
      JOIN recipes r ON rs.id_recipe = r.id
      WHERE r.id_cocktail = ?
      ORDER BY rs.step_number ASC
    `;

    cocktail.pasos = this.db.prepare(stepsQuery).all(id);

    return cocktail;
  }

  /**
   * Buscar cócteles por nombre
   */
  searchByName(searchTerm) {
    const query = `
      SELECT DISTINCT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty AS dificultad,
        c.description AS descripcion,
        GROUP_CONCAT(cat.name, ', ') AS categorias
      FROM cocktails c
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      WHERE c.name LIKE ? OR c.description LIKE ?
      GROUP BY c.id
      ORDER BY 
        CASE WHEN c.name LIKE ? THEN 1 ELSE 2 END,
        c.name ASC
    `;

    const searchPattern = `%${searchTerm}%`;
    const exactPattern = `${searchTerm}%`;

    return this.db.prepare(query).all(searchPattern, searchPattern, exactPattern);
  }

  /**
   * Filtrar cócteles por dificultad
   */
  findByDifficulty(difficulty) {
    const query = `
      SELECT DISTINCT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty AS dificultad,
        c.description AS descripcion,
        c.preparation_time AS tiempo_preparacion,
        GROUP_CONCAT(cat.name, ', ') AS categorias
      FROM cocktails c
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      WHERE c.difficulty = ?
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    return this.db.prepare(query).all(difficulty);
  }

  /**
   * Obtener cócteles por categoría
   */
  findByCategory(categoryId) {
    if (categoryId === undefined || categoryId === null) {
      throw new Error('Category ID is required');
    }
    const query = `
      SELECT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty AS dificultad,
        c.description AS descripcion,
        c.preparation_time AS tiempo_preparacion
      FROM cocktails c
      JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      WHERE cc.id_category = ?
      ORDER BY c.name ASC
    `;

    return this.db.prepare(query).all(categoryId);
  }

  /**
   * Crear cóctel completo con ingredientes y pasos
   */
  createComplete(cocktailData) {
    const transaction = this.db.transaction(() => {
      // 1. Crear el cóctel (sin id_category)
      const cocktailId = this.create({
        name: cocktailData.name,
        img_url: cocktailData.img_url || null,
        difficulty: cocktailData.difficulty,
        description: cocktailData.description || null,
        additional_notes: cocktailData.additional_notes || null,
        preparation_time: cocktailData.preparation_time || null,
        servings: cocktailData.servings || 1,
        alcohol_content: cocktailData.alcohol_content || null,
        is_featured: cocktailData.is_featured || 0,
        id_owner: cocktailData.id_owner || null,
        id_pairing: cocktailData.id_pairing || null,
      });

      // 2. Crear la receta
      const recipeStmt = this.db.prepare(`
        INSERT INTO recipes (id_cocktail, glass_type, garnish, serving_suggestion)
        VALUES (?, ?, ?, ?)
      `);

      const recipeResult = recipeStmt.run(
        cocktailId,
        cocktailData.glass_type || null,
        cocktailData.garnish || null,
        cocktailData.serving_suggestion || null,
      );

      const recipeId = recipeResult.lastInsertRowid;

      // 3. Agregar ingredientes si existen
      if (cocktailData.ingredientes && cocktailData.ingredientes.length > 0) {
        const ingredientStmt = this.db.prepare(`
          INSERT INTO recipe_ingredients 
          (id_recipe, id_ingredient, quantity, unit, preparation_note, is_optional, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        cocktailData.ingredientes.forEach((ingrediente, index) => {
          ingredientStmt.run(
            recipeId,
            ingrediente.id_ingredient,
            ingrediente.quantity,
            ingrediente.unit,
            ingrediente.preparation_note || null,
            ingrediente.is_optional || 0,
            ingrediente.order_index || index,
          );
        });
      }

      // 4. Agregar pasos si existen
      if (cocktailData.pasos && cocktailData.pasos.length > 0) {
        const stepStmt = this.db.prepare(`
          INSERT INTO recipe_steps (id_recipe, step_number, instruction, duration, is_critical)
          VALUES (?, ?, ?, ?, ?)
        `);

        cocktailData.pasos.forEach((paso, index) => {
          stepStmt.run(
            recipeId,
            paso.step_number || index + 1,
            paso.instruction,
            paso.duration || null,
            paso.is_critical || 0,
          );
        });
      }

      // 5. Agregar categorías si existen (ahora todas van por cocktail_categories)
      const categoryStmt = this.db.prepare(`
        INSERT INTO cocktail_categories (id_cocktail, id_category)
        VALUES (?, ?)
      `);

      // Agregar categoría principal si existe
      if (cocktailData.id_category) {
        categoryStmt.run(cocktailId, cocktailData.id_category);
      }

      // Agregar categorías adicionales si existen
      if (cocktailData.categorias_adicionales && cocktailData.categorias_adicionales.length > 0) {
        cocktailData.categorias_adicionales.forEach(categoryId => {
          // Evitar duplicar la categoría principal
          if (categoryId !== cocktailData.id_category) {
            categoryStmt.run(cocktailId, categoryId);
          }
        });
      }

      // Agregar categorías directamente si se especifican
      if (cocktailData.categorias && cocktailData.categorias.length > 0) {
        cocktailData.categorias.forEach(categoryId => {
          categoryStmt.run(cocktailId, categoryId);
        });
      }

      return cocktailId;
    });

    return transaction();
  }

  /**
   * Obtener cócteles destacados
   */
  findFeatured() {
    const query = `
      SELECT DISTINCT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty AS dificultad,
        c.description AS descripcion,
        c.preparation_time AS tiempo_preparacion,
        GROUP_CONCAT(cat.name, ', ') AS categorias
      FROM cocktails c
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      WHERE c.is_featured = 1
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    return this.db.prepare(query).all();
  }

  /**
   * Obtener estadísticas de cócteles
   */
  getStatistics() {
    // Para compatibilidad con tests que mockean prepare().get()
    const query = `
      SELECT 
        COUNT(*) as total_cocktails,
        SUM(CASE WHEN alcohol_content > 0 THEN 1 ELSE 0 END) as alcoholic_cocktails,
        SUM(CASE WHEN alcohol_content = 0 OR alcohol_content IS NULL THEN 1 ELSE 0 END) as non_alcoholic_cocktails,
        AVG(alcohol_content) as avg_alcohol_content,
        AVG(preparation_time) as avg_preparation_time
      FROM cocktails
    `;
    const stmt = this.db.prepare(query);
    return stmt.get();
  }

  /**
   * Métodos de compatibilidad con el sistema anterior
   */
  obtenerTodosCocteles() {
    return this.findAllWithBasicInfo();
  }

  obtenerCoctelPorId(id) {
    return this.findCompleteById(id);
  }

  buscarCoctelesPorNombre(nombre) {
    return this.searchByName(nombre);
  }

  /**
   * Buscar cócteles por contenido de alcohol
   */
  findByAlcoholContent(isAlcoholic) {
    const query = `
      SELECT
        c.id,
        c.name,
        c.description,
        c.difficulty,
        c.preparation_time AS tiempo_preparacion,
        c.alcohol_content,
        c.img_url,
        GROUP_CONCAT(cat.name, ', ') AS categorias
      FROM cocktails c
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      WHERE ${isAlcoholic ? 'c.alcohol_content > 0' : '(c.alcohol_content = 0 OR c.alcohol_content IS NULL)'}
      GROUP BY c.id
      ORDER BY c.name
    `;
    const stmt = this.db.prepare(query);
    return stmt.all();
  }

  /**
   * Buscar cócteles por creador
   */
  findByCreator(creatorId) {
    const query = `
      SELECT
        c.id,
        c.name,
        c.description,
        c.difficulty,
        c.preparation_time AS tiempo_preparacion,
        c.alcohol_content,
        c.img_url,
        c.id_creator,
        GROUP_CONCAT(cat.name, ', ') AS categorias
      FROM cocktails c
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      WHERE c.id_creator = ?
      GROUP BY c.id
      ORDER BY c.name
    `;
    const stmt = this.db.prepare(query);
    return stmt.all(creatorId);
  }

  /**
   * Obtener categorías de un cóctel
   */
  getCategoriesForCocktail(cocktailId) {
    const query = `
      SELECT cat.id, cat.name, cat.color
      FROM categories cat
      INNER JOIN cocktail_categories cc ON cat.id = cc.id_category
      WHERE cc.id_cocktail = ?
      ORDER BY cat.name
    `;
    const stmt = this.db.prepare(query);
    return stmt.all(cocktailId);
  }

  /**
   * Agregar cóctel a una categoría
   */
  addToCategory(cocktailId, categoryId) {
    const query = `
      INSERT OR IGNORE INTO cocktail_categories (id_cocktail, id_category)
      VALUES (?, ?)
    `;
    const stmt = this.db.prepare(query);
    const result = stmt.run(cocktailId, categoryId);
    return result.lastInsertRowid;
  }

  /**
   * Remover cóctel de una categoría
   */
  removeFromCategory(cocktailId, categoryId) {
    const query = `
      DELETE FROM cocktail_categories
      WHERE id_cocktail = ? AND id_category = ?
    `;
    const stmt = this.db.prepare(query);
    const result = stmt.run(cocktailId, categoryId);
    return result.changes;
  }

  getDifficulty(cocktailId) {
    const row = this.db.prepare(`SELECT difficulty FROM cocktails WHERE id = ?`).get(cocktailId);
    return row?.difficulty ?? null;
  }

  getTotalDuration(cocktailId) {
    const row = this.db
      .prepare(
        `
        SELECT SUM(rs.duration) AS total_duration
        FROM recipe_steps rs
        JOIN recipes r ON rs.id_recipe = r.id
        WHERE r.id_cocktail = ?
      `,
      )
      .get(cocktailId);
    return row?.total_duration ?? 0;
  }

  /**
   * Búsqueda avanzada de cócteles con múltiples filtros
   * @param {Object} filters - Objeto con los filtros a aplicar
   * @param {string} filters.search - Término de búsqueda por nombre o descripción
   * @param {string} filters.difficulty - Filtro por dificultad
   * @param {string} filters.category - Filtro por categoría
   * @param {Array<string>} filters.ingredients - Filtro por ingredientes
   * @param {boolean} filters.isAlcoholic - Filtro por contenido alcohólico
   * @param {string} filters.sortBy - Campo para ordenar (name, difficulty, preparation_time)
   * @param {string} filters.sortOrder - Orden ascendente o descendente (ASC, DESC)
   */
  searchWithFilters(filters = {}) {
    const {
      search,
      difficulty,
      category,
      ingredients = [],
      isAlcoholic,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = filters;

    let query = `
      SELECT DISTINCT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty,
        c.description AS descripcion,
        c.preparation_time AS tiempo_preparacion,
        c.alcohol_content,
        r.glass_type,
        GROUP_CONCAT(DISTINCT cat.name) AS categorias
      FROM cocktails c
      LEFT JOIN recipes r ON c.id = r.id_cocktail
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      LEFT JOIN recipe_ingredients ri ON r.id = ri.id_recipe
      LEFT JOIN ingredients ing ON ri.id_ingredient = ing.id
      WHERE 1=1
    `;

    const params = [];
    const conditions = [];

    // Filtro por búsqueda de texto (nombre o descripción)
    if (search && search.trim()) {
      conditions.push('(c.name LIKE ? OR c.description LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern);
    }

    // Filtro por dificultad
    if (difficulty) {
      conditions.push('c.difficulty = ?');
      params.push(difficulty);
    }

    // Filtro por categoría
    if (category) {
      conditions.push('cat.name = ?');
      params.push(category);
    }

    // Filtro por ingredientes
    if (ingredients.length > 0) {
      const ingredientConditions = ingredients.map(() => 'ing.name LIKE ?').join(' OR ');
      conditions.push(`(${ingredientConditions})`);
      ingredients.forEach(ingredient => {
        params.push(`%${ingredient}%`);
      });
    }

    // Filtro por contenido alcohólico
    if (typeof isAlcoholic === 'boolean') {
      if (isAlcoholic) {
        conditions.push('c.alcohol_content > 0');
      } else {
        conditions.push('(c.alcohol_content = 0 OR c.alcohol_content IS NULL)');
      }
    }

    // Agregar condiciones WHERE
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // Agrupar por cóctel
    query += ' GROUP BY c.id';

    // Ordenamiento
    const allowedSortFields = ['name', 'difficulty', 'preparation_time', 'alcohol_content'];
    const allowedSortOrders = ['ASC', 'DESC'];

    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase())
      ? sortOrder.toUpperCase()
      : 'ASC';

    // Orden especial para búsqueda por texto (relevancia)
    if (search && search.trim()) {
      if (safeSortBy === 'difficulty') {
        query += `
          ORDER BY 
            CASE WHEN c.name LIKE ? THEN 1 ELSE 2 END,
            CASE c.difficulty 
              WHEN 'muy fácil' THEN 1
              WHEN 'fácil' THEN 2  
              WHEN 'media' THEN 3
              WHEN 'difícil' THEN 4
              WHEN 'muy difícil' THEN 5
              ELSE 6
            END ${safeSortOrder}
        `;
      } else {
        query += `
          ORDER BY 
            CASE WHEN c.name LIKE ? THEN 1 ELSE 2 END,
            c.${safeSortBy} ${safeSortOrder}
        `;
      }
      params.push(`${search.trim()}%`);
    } else {
      if (safeSortBy === 'difficulty') {
        query += ` ORDER BY CASE c.difficulty 
          WHEN 'muy fácil' THEN 1
          WHEN 'fácil' THEN 2  
          WHEN 'media' THEN 3
          WHEN 'difícil' THEN 4
          WHEN 'muy difícil' THEN 5
          ELSE 6
        END ${safeSortOrder}`;
      } else {
        query += ` ORDER BY c.${safeSortBy} ${safeSortOrder}`;
      }
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Buscar cócteles por ingredientes específicos
   */
  findByIngredients(ingredientNames = []) {
    if (ingredientNames.length === 0) {
      return [];
    }

    // Construir placeholders para los ingredientes
    const placeholders = ingredientNames.map(() => '?').join(',');

    const query = `
      SELECT DISTINCT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty,
        c.description AS descripcion,
        c.preparation_time AS tiempo_preparacion,
        COUNT(DISTINCT ing.id) as matching_ingredients,
        GROUP_CONCAT(DISTINCT cat.name) AS categorias
      FROM cocktails c
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      LEFT JOIN recipes r ON c.id = r.id_cocktail
      JOIN recipe_ingredients ri ON r.id = ri.id_recipe
      JOIN ingredients ing ON ri.id_ingredient = ing.id
      WHERE ing.name IN (${placeholders})
      GROUP BY c.id
      ORDER BY matching_ingredients DESC, c.name ASC
    `;

    const stmt = this.db.prepare(query);
    return stmt.all(...ingredientNames);
  }

  /**
   * Obtener sugerencias de autocompletar para búsqueda
   */
  getSearchSuggestions(term, limit = 10) {
    if (!term || term.trim().length < 2) {
      return [];
    }

    const searchPattern = `%${term.trim()}%`;

    const query = `
      SELECT DISTINCT
        c.name AS suggestion,
        'cocktail' AS type
      FROM cocktails c
      WHERE c.name LIKE ?
      UNION
      SELECT DISTINCT
        ing.name AS suggestion,
        'ingredient' AS type
      FROM ingredients ing
      WHERE ing.name LIKE ?
      UNION
      SELECT DISTINCT
        cat.name AS suggestion,
        'category' AS type
      FROM categories cat
      WHERE cat.name LIKE ?
      ORDER BY suggestion ASC
      LIMIT ?
    `;

    const stmt = this.db.prepare(query);
    return stmt.all(searchPattern, searchPattern, searchPattern, limit);
  }

  /**
   * Buscar cócteles con tolerancia a errores ortográficos simples
   */
  fuzzySearch(searchTerm, _threshold = 0.7) {
    if (!searchTerm || searchTerm.trim().length < 3) {
      return [];
    }

    // Para errores simples, usar LIKE con wildcards
    const patterns = [
      `%${searchTerm}%`, // Coincidencia exacta
      `%${searchTerm.slice(0, -1)}%`, // Sin última letra
      `%${searchTerm.slice(1)}%`, // Sin primera letra
    ];

    let query = `
      SELECT DISTINCT
        c.id,
        c.name AS nombre,
        c.img_url AS imagen,
        c.difficulty,
        c.description AS descripcion,
        c.preparation_time AS tiempo_preparacion,
        GROUP_CONCAT(DISTINCT cat.name) AS categorias,
        CASE 
    `;

    const params = [];

    // Asignar puntuaciones de relevancia
    patterns.forEach((pattern, index) => {
      query += ` WHEN c.name LIKE ? THEN ${patterns.length - index}`;
      params.push(pattern);
    });

    query += ` ELSE 0 END AS relevance_score
      FROM cocktails c
      LEFT JOIN cocktail_categories cc ON c.id = cc.id_cocktail
      LEFT JOIN categories cat ON cc.id_category = cat.id
      WHERE (`;

    // Agregar condiciones OR para todos los patrones
    const conditions = patterns.map(() => 'c.name LIKE ?').join(' OR ');
    query += `${conditions})`;
    params.push(...patterns);

    query += `
      GROUP BY c.id
      HAVING relevance_score > 0
      ORDER BY relevance_score DESC, c.name ASC
    `;

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }
}

export default CocktailRepository;
