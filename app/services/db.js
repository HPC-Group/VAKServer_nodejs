/**
 * Created by my on 11.07.16.
 */

var config;

if (process.env.NODE_ENV === 'production') {
    config = require('./config.production');

}  else {
    config = require('./config');
}

var endpoint = config.couchbase.detailed_errors === 1 ? config.couchbase.endpoint + '?detailed_errcodes=1' : config.couchbase.endpoint;
var bucket = config.couchbase.bucket;

var couchbase = require('couchbase');
var N1QL = require('couchbase').N1qlQuery;

var cluster = new couchbase.Cluster(endpoint);
var db = cluster.openBucket(bucket);

function query(sql, done) {
    // Setup Query
    var N1qlQuery = couchbase.N1qlQuery;

    // Check if configured to show queries in console
    if (config.couchbase.showQuery) {
        console.log(`QUERY: ${sql}`);
    }

    // Make a N1QL specific Query
    var query = N1qlQuery.fromString(sql);

    // Issue Query
    db.query(query,function(err, result){
        if (err) {
            console.log(`ERROR: ${err}`);
            done(err, null);

            return;
        }

        done(null, result);
    });
}

module.exports.query = query;
module.exports.bucket = bucket;
