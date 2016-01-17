var TaskManager = require('./lib/taskmanager'),
    cc = require('create-coroutine'),
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
    setTimeout(function(){
        if(self.runCount > 0) return;
        if(hasProcessArg){
            self.exec(process.argv[2]);
        }else if(typeof options.default !== 'undefined'){
            self.exec(options.default);
        }
    }, 11);
}

Penumbra.prototype = Object.create(TaskManager.prototype);
var execute = TaskManager.prototype.exec;
Penumbra.prototype.exec = function(){
    if(!arguments.length){
        if(hasProcessArg){
            return execute.call(this, process.argv[2]);
        }else if(typeof window !== 'undefined'){
            var pathArray = window.location.pathname.split( '/' );
            if(pathArray.length > 0 && pathArray[0].length){
                return execute.call(this, pathArray[0]);
            }
        }
    }

    return execute.apply(this, arguments);
};

function PenumbraFactory(options){
    return new Penumbra(options);
}

PenumbraFactory.runDefault = function(fn){
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
