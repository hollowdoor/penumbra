var isEqualRegex = require('is-equal-regex');

module.exports = function indexOf(list, val){
    if(val instanceof RegExp){
        for(var i=0; i<list.length; i++){
            if(isEqualRegex(list[i], val)){
                return i;
            }
        }
        return -1;
    }

    return list.indexOf(val);
};
