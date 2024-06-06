const {Router} = require('express');
const studyController = require('../controllers/studyController');
const router = Router();

router.get('/study', studyController.study_get);

module.exports = router