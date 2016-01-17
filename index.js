var TaskManager = require('./lib/taskmanager'),
    cc = require('create-coroutine'),
    execute = TaskManager.prototype.exec,
    hasProcessArg =
    (process && Object.prototype.toString.call(process.argv) === '[object Array]' && process.argv[2]);

/*
git remote add origin https://github.com/hollowdoor/penumbra.git
git push -u origin master
*/

function Penumbra(options){
    options = options || {};
    TaskManager.call(this);
    var self = this;
    this.execError = null;

    setTimeout(function(){
        if(self.runCount > 0 || self.execError) return;
        var args = getArgs();
        if(args.length){
            self.exec.apply(self, args);
        }else if(options.default){
            self.exec(options.default);
        }
    }, 11);
}

Penumbra.prototype = Object.create(TaskManager.prototype);

Penumbra.prototype.exec = function(){
    var self = this;
    if(arguments.length){
        for(var i=0; i<arguments.length; i++){
            if(typeof arguments[i] !== 'string'){
                return new Promise(function(){
                    throw (self.execError = new Error('Arguments to .exec must be strings.'));
                });
            }
        }

        return execute.apply(this, arguments);
    }

    return Promise.resolve(null);
};

function PenumbraFactory(options){
    return new Penumbra(options);
}

PenumbraFactory.runDefault = function(fn){
    //deprecate this static method.
    if(!fn) return;
    if(!hasProcessArg){
        return cc.run(fn);
    }else if(typeof window !== 'undefined'){
        var pathArray = window.location.pathname.split( '/' );
        if(!pathArray.length){
            return cc.run(fn);
        }
    }
};

module.exports = PenumbraFactory;

function getArgs(){
    var arg = (typeof process === 'object' &&
                Object.prototype.toString.call(process.argv) === '[object Array]' &&
                process.argv[2]);

    if(arg){
        return [arg];
    }

    if(typeof window !== 'undefined'){
        var pathArray = window.location.pathname.split( '/' );
        if(pathArray.length > 0 && pathArray[0].length){
            return [pathArray[0]];
        }
    }

    return [];
}
