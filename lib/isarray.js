module.exports = function isarr(val){
    return Object.prototype.toString.call(val) === '[object Array]';
};
