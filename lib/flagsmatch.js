module.exports = function flagsMatch(src, toTest){
    for(var i=0; i<toTest.length; i++){
        if(src.indexOf(toTest[i]) === -1){
            return false;
        }
    }

    return true;
};
