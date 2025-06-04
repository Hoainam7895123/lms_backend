const express = require('express');

const router = express.Router();

router.use(require('./account'));
router.use(require('./lms_course'));
router.use(require('./lms_topic'));
router.use(require('./lms_block'));
router.use(require('./homework'));
router.use(require('./slide'));
router.use(require('./admin'));
router.use(require('./user'));
router.use(require('./join_request'));
router.use(require('./submission'));
router.use(require('./export-report'));
router.use(require('./mobile/mobile'));
router.use(require('./upload'));
router.use(require('./googleAuth'));
router.use(require('./chatbot'));

router.use(require('./notification'));

module.exports = router;
