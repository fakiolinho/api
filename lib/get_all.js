var minimatch = require('minimatch');
var is = require('annois');
var fp = require('annofp');
var zip = require('annozip');


module.exports = function(model, query, cb) {
    if(!is.object(query) || fp.count(query) === 0) {
        return is.fn(cb)? cb(null, model._data): query(null, model._data);
    }
    var fields = query.fields;
    var limit = query.limit;
    var offset = query.offset || 0;

    delete query.fields;
    delete query.limit;
    delete query.offset;

    var zq = zip(query);
    var ret = model._data;

    if(fp.count(query)) {
        ret = ret.filter(function(o) {
            return zq.map(function(p) {
                var a = o[p[0]]? o[p[0]].toLowerCase(): '';
                var b = p[1]? p[1].toLowerCase(): '';

                return minimatch(a, b);
            }).filter(fp.id).length === zq.length;
        });
    }

    if(fields) {
        fields = is.array(fields)? fields: [fields];

        ret = ret.map(function(o) {
           var r = {};

            fields.forEach(function(k) {
                r[k] = o[k];
            });

            return r;
        });
    }

    if(limit) {
        ret = ret.slice(offset, offset + limit);
    }

    cb(null, ret);
};