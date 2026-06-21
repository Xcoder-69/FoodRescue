const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const { requireAuth } = require('../../middleware/auth');
const { validate, authSchemas } = require('./auth.validator');

// Public Routes
router.post('/register', validate(authSchemas.register), AuthController.register);
router.post('/login', validate(authSchemas.login), AuthController.login);
router.post('/google', validate(authSchemas.google), AuthController.googleLogin);
router.post('/refresh', AuthController.refresh);

// Protected Routes (Require valid Access Token)
router.post('/logout', requireAuth, AuthController.logout);

// Session Management
router.get('/sessions', requireAuth, AuthController.getSessions);
router.delete('/sessions/:sessionId', requireAuth, AuthController.revokeSession);

// 2FA Routes (Require valid Access Token)
router.post('/2fa/setup', requireAuth, AuthController.setup2FA);
router.post('/2fa/verify-setup', requireAuth, AuthController.verify2FASetup);
router.post('/2fa/verify-login', requireAuth, AuthController.verify2FALogin);

module.exports = router;
