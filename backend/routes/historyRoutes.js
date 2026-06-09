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
 * /history/api:
 *   get:
 *     summary: Get user's shopping history
 *     tags: [History]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of history items
 *       500:
 *         description: Server error
 */
router.get('/api', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, quantity, price, category, cleared_at FROM history WHERE user_id = $1 ORDER BY cleared_at DESC',
      [req.session.userId]
    );

    const history = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity,
      price: parseFloat(row.price),
      category: row.category,
      clearedAt: row.cleared_at
    }));

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load history'
    });
  }
});

/**
 * @swagger
 * /history/clear-all:
 *   delete:
 *     summary: Clear all history
 *     tags: [History]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: History cleared successfully
 *       500:
 *         description: Server error
 */
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM history WHERE user_id = $1',
      [req.session.userId]
    );

    res.json({
      success: true,
      message: `Deleted ${result.rowCount} items from history`,
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear history'
    });
  }
});

/**
 * @swagger
 * /history/save-completed:
 *   post:
 *     summary: Move completed items to history
 *     tags: [History]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Items moved to history
 *       500:
 *         description: Server error
 */
router.post('/save-completed', async (req, res) => {
  try {
    // Find all completed items for the user
    const completedItems = await pool.query(
      'SELECT name, quantity, price, category FROM items WHERE user_id = $1 AND completed = true',
      [req.session.userId]
    );

    if (completedItems.rows.length === 0) {
      return res.json({
        success: true,
        message: 'No completed items to move to history',
        movedCount: 0
      });
    }

    // Insert into history
    const values = completedItems.rows.map((item, index) => {
      const offset = index * 4;
      return `($1, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    }).join(', ');

    const params = [req.session.userId];
    completedItems.rows.forEach(item => {
      params.push(item.name, item.quantity, item.price, item.category);
    });

    await pool.query(
      `INSERT INTO history (user_id, name, quantity, price, category) VALUES ${values}`,
      params
    );

    // Delete the completed items from main list
    await pool.query(
      'DELETE FROM items WHERE user_id = $1 AND completed = true',
      [req.session.userId]
    );

    res.json({
      success: true,
      message: `Moved ${completedItems.rows.length} items to history`,
      movedCount: completedItems.rows.length
    });
  } catch (error) {
    console.error('Error moving items to history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move items to history'
    });
  }
});

/**
 * @swagger
 * /history/clear-shopping-list:
 *   delete:
 *     summary: Clear all shopping list items and move to history
 *     tags: [History]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Shopping list cleared
 *       500:
 *         description: Server error
 */
router.delete('/clear-shopping-list', async (req, res) => {
  try {
    // First, move all items to history
    const allItems = await pool.query(
      'SELECT name, quantity, price, category FROM items WHERE user_id = $1',
      [req.session.userId]
    );

    if (allItems.rows.length === 0) {
      return res.json({
        success: true,
        message: 'Shopping list is already empty',
        clearedCount: 0
      });
    }

    // Insert into history
    const values = allItems.rows.map((item, index) => {
      const offset = index * 4;
      return `($1, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    }).join(', ');

    const params = [req.session.userId];
    allItems.rows.forEach(item => {
      params.push(item.name, item.quantity, item.price, item.category);
    });

    await pool.query(
      `INSERT INTO history (user_id, name, quantity, price, category) VALUES ${values}`,
      params
    );

    // Delete all items from shopping list
    const deleteResult = await pool.query(
      'DELETE FROM items WHERE user_id = $1',
      [req.session.userId]
    );

    res.json({
      success: true,
      message: `Cleared ${deleteResult.rowCount} items from shopping list`,
      clearedCount: deleteResult.rowCount
    });
  } catch (error) {
    console.error('Error clearing shopping list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear shopping list'
    });
  }
});

/**
 * @swagger
 * /history/stats:
 *   get:
 *     summary: Get history statistics
 *     tags: [History]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: History statistics
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as total, COALESCE(SUM(price), 0) as total_spent, COUNT(DISTINCT DATE(cleared_at)) as lists_cleared FROM history WHERE user_id = $1',
      [req.session.userId]
    );

    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        totalItems: parseInt(stats.total),
        totalSpent: parseFloat(stats.total_spent),
        listsCleared: parseInt(stats.lists_cleared)
      }
    });
  } catch (error) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load statistics'
    });
  }
});

module.exports = router;
