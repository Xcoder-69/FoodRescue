const express = require('express');
const router = express.Router();
const ComplaintController = require('./complaint.controller');
const { requireAuth } = require('../../middleware/auth');

router.use(requireAuth);

router.post('/', ComplaintController.fileComplaint);
router.get('/my-complaints', ComplaintController.getMyComplaints);

module.exports = router;
