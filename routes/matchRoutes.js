const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');

const { getAllMatches, createMatch, getMatch, updateMatch, deleteMatch } = require('../controllers/matchController');

router.route('/').get(getAllMatches).post(requireAuth, createMatch);
router.route('/:id').get(getMatch).put(requireAuth, updateMatch).delete(requireAuth, deleteMatch);


module.exports = router;