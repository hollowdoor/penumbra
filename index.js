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
    return function penumbraCallback(arg1){
        if(arg1 !== undefined){
            //Use request object
            if(typeof arg1 === 'object' && arg1.url === 'string'){
                a = req.url.match('^[^?]*')[0];
                a = a.split('/');
                return runTasks(main, main.options, a.length ? [a[0]] : null);
            }
        }
        runTasks(main, main.options)
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
        runTasks(main, options);
    }, 11);
}

function runTasks(main, options, args){
    args = args || getArgs().slice(0);

    if(args.length){
        main.exec.apply(main, args);
    }else if(options.default){
        main.exec(options.default);
    }
}
