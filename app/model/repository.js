/**
 * Created by my on 11.07.16.
 */

var db = require('../services/db');
var config = require('../services/config');
var appNameKey = config.models.appKeyName;
var bucket = db.bucket;

function query(queryString, done) {
    'use strict';

    db.query(queryString, function (error, result) {
        if (error) {
            done(error, null);

            return;
        }

        done(null, result);
    });
}
/**
 * finds all apps in the db and groups them by name
 *
 * @param done Function
 */
module.exports.findAllApps = function (done) {
    'use strict';

    var queryString = `SELECT ${appNameKey} FROM ${bucket}`+
        ` WHERE type = "session"` +
        ` GROUP BY ${appNameKey}`;

    return query(queryString, done);
};

/**
 * finds all sessions by app
 *
 * @param appName string
 * @param done function
 */
module.exports.findSessionsByApp = function (appName, done) {
    'use strict';

    var queryString = `SELECT alias, startTimestamp, endTimestamp, entityId, ARRAY_COUNT(stateIdCollection) as statesCount` +
        ` FROM ${bucket}`+
        ` WHERE type = "session"` +
        ` AND ${appNameKey} = "${appName}"` +
        ` AND endTimestamp IS NOT MISSING` +
        //` GROUP BY alias` +
        ` ORDER BY startTimestamp DESC`;

    return query(queryString, done);
};

module.exports.findSessionProvenance = function (sessionId, done) {
    'use strict';

    var queryString = `SELECT provenance` +
        ` FROM ${bucket}`+
        ` WHERE type = "session"` +
        ` AND entityId = "${sessionId}"` +
        ` LIMIT 1`
        ;

    return query(queryString, done);
};

module.exports.findStateProvenance = function (sessionId, limit, done) {
    'use strict';
    if (sessionId === undefined) {
        return null;
    }

    var queryString = `SELECT provenance, entityId` +
            ` FROM ${bucket}`+
            ` WHERE type = "state"` +
            ` AND sessionId = "${sessionId}"`
        ;

    if (typeof limit === 'function') {
        done = limit;

    } else {
        queryString += ` LIMIT ${limit}`;
    }

    return query(queryString, done);
};

/**
 * finds all states by session id
 *
 * @param sessionId string
 * @param done function
 */
module.exports.findStatesBySession = function (sessionId, done) {
    'use strict';

    var queryString = `SELECT tags, timestamp, comment, entityId, level, data` +
        ` FROM ${bucket}`+
        ` WHERE type = "state"` +
        ` AND sessionId = "${sessionId}"` +
        ` ORDER BY timestamp ASC`;

    return query(queryString, done);
};


module.exports.findStateTags = function (sessionId, done) {
    'use strict';

    var queryString = `SELECT tags, timestamp, data` +
        ` FROM ${bucket}`+
        ` WHERE type = "state"` +
        ` AND sessionId = "${sessionId}"` +
        ` ORDER BY timestamp ASC`;

    return query(queryString, done);
};