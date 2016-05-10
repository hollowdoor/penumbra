var TaskManager = require('./lib/taskmanager'),
    cc = require('create-coroutine'),
    getArgs = require('get-command-args'),
    getFlags = require('get-command-flags'),
    execute = TaskManager.prototype.exec;

/*
git remote add origin https://github.com/hollowdoor/penumbra.git
git push -u origin master
*/

function Penumbra(options){
    options = options || {};
    this.options = options;

    if(typeof options.autoRun !== 'boolean'){
        options.autoRun = true;
    }
    TaskManager.call(this);

    if(options.autoRun){
        autoRun(this, options);
    }

}

Penumbra.prototype = Object.create(TaskManager.prototype);
Penumbra.prototype.constructor = Penumbra;
Penumbra.prototype.callback = function(){
    var main = this;
    return function penumbraCallback(arg1, arg2){
        var ctx = main, args;
        if(arg1 !== undefined){
            //Use request object
            if(typeof arg1 === 'object'){
                if(arg1.url === 'string'){
                    args = req.url.match(/^[^?]*/)[0];
                    args = args.split('/').slice(0);
                    ctx = arg2;
                }
            }
        }
        runTasks(main, main.options, ctx, args.length ? args : null);
    };
};

function PenumbraFactory(options){
    return new Penumbra(options);
}

Object.defineProperty(PenumbraFactory, 'flags', {
    get: getFlags
});

Object.defineProperty(PenumbraFactory, 'args', {
    get: getArgs
});

module.exports = PenumbraFactory;

function autoRun(main, options){
    setTimeout(function(){
        if(main.runCount > 0 || main.execError) return;
        runTasks(main, options, main);
    }, 11);
}

function runTasks(main, options, ctx, args){
    var flags = getFlags(), flagCount = 0;
    args = args || getArgs().slice(0);

    for(var n in flags) flagCount++;

    if(args.length){
        main.exec.call(ctx, args[0]);
    }else if(main.hasNameless && flagCount){
        main.exec.call(ctx);
    }else if(options.default){
        main.exec.call(ctx, options.default);
    }
}
