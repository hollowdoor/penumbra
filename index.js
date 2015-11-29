var TaskManager = require('./lib/taskmanager'),
    cc = require('create-coroutine'),
    hasProcessArg =
    (process && Object.prototype.toString.call(process.argv) === '[object Array]' && process.argv[2]);

/*
git remote add origin https://github.com/hollowdoor/penumbra.git
git push -u origin master
*/

function Penumbra(){
    TaskManager.call(this);
    var self = this;

    setTimeout(function(){
        if(self.runCount > 0) return;
        if(hasProcessArg){
            self.exec(process.argv[2]);
        }

        /*else {
            self.execDefault();
        }*/
    });
}

Penumbra.prototype = Object.create(TaskManager.prototype);
var execute = TaskManager.prototype.exec;
Penumbra.prototype.exec = function(){
    if(!arguments.length){
        if(hasProcessArg){
            return execute.call(this, process.argv[2]);
        }else if(window){
            var pathArray = window.location.pathname.split( '/' );
            if(pathArray.length && pathArray[0].length){
                return execute.call(this, pathArray[0]);
            }
        }
    }

    return execute.apply(this, arguments);
};

function PenumbraFactory(){
    return new Penumbra();
}

PenumbraFactory.runDefault = function(fn){
    if(!fn) return;
    if(hasProcessArg){
        return cc.run(fn);
    }else if(window){
        var pathArray = window.location.pathname.split( '/' );
        if(pathArray.length && pathArray[0].length){
            return cc.run(fn);
        }
    }
};

module.exports = PenumbraFactory;
