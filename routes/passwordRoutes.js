const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, passwordController.createPassword);
router.get('/', authMiddleware, passwordController.getPasswords);
router.put('/:id', authMiddleware, passwordController.updatePassword);
router.delete('/:id', authMiddleware, passwordController.deletePassword);

module.exports = router;

