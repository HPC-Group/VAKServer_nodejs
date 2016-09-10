var express = require('express');
var router = express.Router();
var apiImpl = require('./api/apiImpl');

router.get('/apps', apiImpl.findAllApps);

router.get('/sessions', apiImpl.findSessionsByApp);
router.get('/session/prov', apiImpl.findSessionProvenance);
router.get('/session/prov-bundle', apiImpl.buildProvenanceBundle);

router.get('/states', apiImpl.findStatesBySession);
router.get('/states/tags', apiImpl.findStateTags);


module.exports = router;
