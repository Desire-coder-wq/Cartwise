const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.isAuthenticated) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Please log in'
    });
  }
  next();
};

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         quantity:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *           enum: [Produce, Dairy, Meat, Bakery, Frozen, Beverages, Snacks, Other]
 *         completed:
 *           type: boolean
 *         userId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items for the authenticated user
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, quantity, price, category, completed, created_at FROM items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.session.userId]
    );

    const items = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      price: parseFloat(row.price),
      category: row.category,
      completed: row.completed,
      createdAt: row.created_at
    }));

    res.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items'
    });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item details
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, quantity, price, category, completed, created_at FROM items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const item = result.rows[0];
    res.json({
      success: true,
      item: {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        category: item.category,
        completed: item.completed,
        createdAt: item.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item'
    });
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: string
 *                 default: "1"
 *               price:
 *                 type: number
 *                 default: 0
 *               category:
 *                 type: string
 *                 enum: [Produce, Dairy, Meat, Bakery, Frozen, Beverages, Snacks, Other]
 *                 default: Other
 *     responses:
 *       201:
 *         description: Item created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    const validCategories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Beverages', 'Snacks', 'Other'];
    const normalizedCategory = validCategories.includes(category) ? category : 'Other';

    const result = await pool.query(
      'INSERT INTO items (name, quantity, price, category, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, quantity, price, category, completed, created_at',
      [name.trim(), quantity || '1', price || 0, normalizedCategory, req.session.userId]
    );

    const item = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item: {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        category: item.category,
        completed: item.completed,
        createdAt: item.created_at
      }
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create item'
    });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, quantity, price, category, completed } = req.body;

    // Check if item exists
    const existingItem = await pool.query(
      'SELECT id FROM items WHERE id = $1 AND user_id = $2',
      [req.params.id, req.session.userId]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const validCategories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen', 'Beverages', 'Snacks', 'Other'];
    const normalizedCategory = validCategories.includes(category) ? category : 'Other';

    const result = await pool.query(
      'UPDATE items SET name = COALESCE($1, name), quantity = COALESCE($2, quantity), price = COALESCE($3, price), category = COALESCE($4, category), completed = COALESCE($5, completed), updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND user_id = $7 RETURNING id, name, quantity, price, category, completed, created_at',
      [name?.trim(), quantity, price, normalizedCategory, completed, req.params.id, req.session.userId]
    );

    const item = result.rows[0];

    res.json({
      success: true,
      message: 'Item updated successfully',
      item: {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        category: item.category,
        completed: item.completed,
        createdAt: item.created_at
      }
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update item'
    });
  }
});

/**
 * @swagger
 * /api/items/{id}/toggle:
 *   patch:
 *     summary: Toggle item completion status
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item toggled successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/toggle', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE items SET completed = NOT completed, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id, name, quantity, price, category, completed, created_at',
      [req.params.id, req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const item = result.rows[0];

    res.json({
      success: true,
      message: `Item marked as ${item.completed ? 'completed' : 'incomplete'}`,
      item: {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        category: item.category,
        completed: item.completed,
        createdAt: item.created_at
      }
    });
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle item'
    });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING id, name, quantity, price, category',
      [req.params.id, req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully',
      deletedItem: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item'
    });
  }
});

/**
 * @swagger
 * /api/items/completed/clear:
 *   delete:
 *     summary: Delete all completed items
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Completed items cleared
 *       500:
 *         description: Server error
 */
router.delete('/completed/clear', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM items WHERE user_id = $1 AND completed = true',
      [req.session.userId]
    );

    res.json({
      success: true,
      message: `${result.rowCount} completed item(s) deleted`,
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('Error clearing completed items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear completed items'
    });
  }
});

/**
 * @swagger
 * /api/items/stats:
 *   get:
 *     summary: Get item statistics
 *     tags: [Items]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Item statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN completed = true THEN 1 END) as completed FROM items WHERE user_id = $1',
      [req.session.userId]
    );

    const stats = result.rows[0];
    const totalItems = parseInt(stats.total);
    const completedItems = parseInt(stats.completed);
    const pendingItems = totalItems - completedItems;

    res.json({
      success: true,
      stats: {
        totalItems,
        completedItems,
        pendingItems,
        completionRate: totalItems > 0 ? ((completedItems / totalItems) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
