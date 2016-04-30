var isArray = require('isarray'),
    r = /^--?[^-]+/,
    r2 = /^-+/;

module.exports = function isFlags(flags){
    if(typeof flags === 'string' && r.test(flags)){
        return [flags.replace(r2, '')];
    }

    if(!isArray(flags)) return false;

    for(var i=0; i<flags.length; i++){
        if(typeof flags[i] !== 'string'){ return false; }
        else if(!r.test(flags[i])){ return false; }
    }

    return flags.map(function(flag){
        return flag.replace(r2, '');
    });
};
