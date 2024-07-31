const {Router} = require('express');
const studyController = require('../controllers/studyController');
const router = Router();

router.get('/study', studyController.study_get);
router.get('/StudyPage/:id', studyController.getStudyPage)
router.post('/StudyPage/:id', studyController.postStudyPage)

module.exports = router