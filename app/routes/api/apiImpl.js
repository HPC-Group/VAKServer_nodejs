/**
 * Created by my on 08.07.16.
 */

var model = require('../../model/repository');

function returnResponse(err, results, res) {
    'use strict';
    if (err) {
        res.status = 400;
        res.send(err);
        return;
    }
    res.status = 202;
    res.send(results);
}

exports.findAllApps = function (req, res, next) {
    'use strict';
    model.findAllApps(function (err, results) {
        return returnResponse(err, results, res);
    });
};

exports.findSessionsByApp = function (req, res, next) {
    'use strict';
    model.findSessionsByApp(req.param('app_name'), function (err, results) {
        return returnResponse(err, results, res);
    });
};

exports.findStatesBySession = function (req, res, next) {
    'use strict';
    model.findStatesBySession(req.param('session_id'), function (err, results) {
        return returnResponse(err, results, res);
    });
};

exports.findStateTags = function (req, res, next) {
    'use strict';
    model.findStateTags(req.param('session_id'), function (err, results) {
        return returnResponse(err, results, res);
    });
};

exports.findSessionProvenance = function (req, res, next) {
    'use strict';
    model.findSessionProvenance(req.param('session_id'), function (err, results) {
        return returnResponse(err, results, res);
    });
};

exports.buildProvenanceBundle = function (req, res, next) {
    'use strict';
    var sessionId = req.param('session_id'),
        limit = req.param('limit', null),
        cb = function (err, results) {
            if (results.length > 0) {
                var sessionBundle = sessionId + 'bundle',
                    whole = {},
                    firstProv = results[0].provenance,
                    entityBundle,
                    bundle = {bundle: {}};

                bundle.bundle[sessionBundle] = {
                    entity: {}
                };

                entityBundle = bundle.bundle[sessionBundle].entity;

                for (var provKey in firstProv) {
                    if (firstProv.hasOwnProperty(provKey)) {
                        whole[provKey] = {};
                    }

                    if (provKey === 'prefix') {
                        whole.prefix = firstProv.prefix;
                    }
                }

                for (var i = 0, len = results.length; i < len; i++) {
                    var prov = results[i].provenance;

                    for (var key in prov) {
                        if (prov.hasOwnProperty(key) && whole[key] && key !== 'prefix') {
                            Object.assign(whole[key], prov[key]);

                            if (key === 'entity') {
                                for (var k in prov.entity) {
                                    if (prov.entity.hasOwnProperty(k)) {
                                        entityBundle[k] = {
                                            'prov:type': 'state'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                results = Object.assign(whole, bundle);
            }

            return returnResponse(err, results, res);
        };

    limit ? model.findStateProvenance(sessionId, limit, cb)
        : model.findStateProvenance(sessionId, cb);
};