const express = require('express');
const path = require('path');
const config = require('./config');
const Logger = require('./logger');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));
const router = express.Router();

router.get('/', (_req, res) => {
	logger.info('Hello, Winston!');
	res.render('index', {
		text: 'We can at least start from a sane place.',
		title: config.appDescription
	});
});
router.post('/click', (_req, res) => {
	logger.debug('post click');
	res.render('click', {});
});

module.exports = router;
