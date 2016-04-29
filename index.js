var TaskManager = require('./lib/taskmanager'),
    cc = require('create-coroutine'),
    getArgs = require('get-command-args'),
    execute = TaskManager.prototype.exec;

/*
git remote add origin https://github.com/hollowdoor/penumbra.git
git push -u origin master
*/

function Penumbra(options){
    options = options || {};
    TaskManager.call(this);
    autoRun(this, options);
}

Penumbra.prototype = Object.create(TaskManager.prototype);
Penumbra.prototype.constructor = Penumbra;

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

function autoRun(pen, options){
    setTimeout(function(){
        if(pen.runCount > 0 || pen.execError) return;
        var args = getArgs();
        if(args.length){
            pen.exec.apply(pen, args);
        }else if(options.default){
            pen.exec(options.default);
        }

    }, 11);

}
