var cc = require('create-coroutine'),
    Matcher = require('multimatcher');

module.exports = TaskManager;

function TaskManager(){
    var main = this;
    this._taskList = [];
    this.tasksComplete = 0;
    this.runCount = 0;
    this.execError = null;

    this.exec = function exec(){

        if(!arguments.length){
            return Promise.resolve(null);
        }

        for(var i=0; i<arguments.length; i++){
            if(typeof arguments[i] !== 'string'){
                return new Promise(function(){
                    throw (main.execError = new Error('Arguments to .exec must be strings.'));
                });
            }
        }

        var names = Array.prototype.slice.call(arguments),
            context = this,
            amount = 0;

        main.runCount++;

        return cc.run(function * (){

            var matcher, index, i,
                toMatch = [],
                value, returnValues = [], depValues;

            for(i=0; i<main._taskList.length; i++){
                toMatch.push(main._taskList[i].name);
            }

            matcher = new Matcher(toMatch);

            for(i=0; i<names.length; i++){

                if((index = matcher.index(names[i])) !== -1){
                    if(main._taskList[index].deps.length){
                        depValues = yield main.exec.apply(context, main._taskList[index].deps);
                    }

                    value = yield main._taskList[index].fn
                        .apply(context, depValues)
                        .then(taskComplete)
                        .catch(handleTaskError);

                    returnValues.push(value);
                }
            }

            function taskComplete(value){
                ++main.tasksComplete;
                return value;
            }

            function handleTaskError(err){
                throw new Error('Error in penumbra task: '+err.message);
            }

            return returnValues;
        });
    };

    Object.defineProperty(main, 'tasks', {
        get: function(){
            return taskString(main);
        }
    });
}

TaskManager.prototype.task = function addTask(name, deps, fn){
    if(fn === undefined){
        fn = deps;
        deps = [];
    }

    this._taskList.push({
        fn: cc(fn),
        deps: deps,
        name: name
    });
};

function taskString(manager){
    var taskList = manager._taskList.map(function(task){
            return {
                name: ''+task.name,
                deps: task.deps.map(function(item){
                    return ''+item;
                })
            };
        });


    function next(list, tab, under){

        return list.reduce(function(last, current, i, a){

            var str = last + tab + current.name + '\n' +
                createUnderline(tab.length, current.name.length) + '\n';

            if(!current.deps.length){
                return str;
            }

            return str +  next(taskList.filter(function(item){
                return this.indexOf(item.name) !== -1;
            }, current.deps), createTab((tab + current.name).length + 2));
        }, '');
    }

    function createTab(n){
        //if(!n) return '';
        var t = '';
        //n = n * 2;
        for(var i=0; i<n; i++)
            t += ' ';
        return t;
    }

    function createUnderline(n1, n2){
        var s = '';
        for(var i=0; i<n2; i++){
            s += '-';
        }
        return createTab(n1) + s;
    }

    return next(taskList, '');
}
