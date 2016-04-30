var cc = require('create-coroutine'),
    Matcher = require('multimatcher'),
    getFlags = require('get-command-flags'),
    getArgs = require('get-command-args'),
    isArray = require('isarray'),
    indexOf = require('./indexof'),
    isFlags = require('./isflags'),
    flagsMatch = require('./flagsmatch');

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
            amount = 0,
            flags = getFlags(),
            flagKeys = Object.keys(flags),
            namesUsed = [];

        main.runCount++;

        main._taskList = getTasks(main._taskList);

        return cc.run(function * (){

            var matcher, index, i, indexes,
                toMatch = [],
                value, returnValues = [], depValues;

            for(i=0; i<main._taskList.length; i++){
                toMatch.push(main._taskList[i].name);
            }

            matcher = new Matcher(toMatch);

            for(i=0; i<names.length && main.runCount < 3; i++){

                indexes = matcher.indexes(names[i]);

                if(indexes.length){

                    for(var j=0; j<indexes.length; j++){

                        if(main._taskList[indexes[j]].useFlag){
                            if(flagsMatch(flagKeys, main._taskList[indexes[i]].useFlag)){
                            //if(flagKeys.indexOf(main._taskList[indexes[j]].useFlag) !== -1){
                                index = indexes[j];
                                break;
                            }else{
                                continue;
                            }
                        }else{
                            index = indexes[j];
                        }
                    }

                    if(main._taskList[index].deps.length){
                        depValues = yield main.exec.apply(context, main._taskList[index].deps);
                    }

                    value = yield main._taskList[index].fn
                        .apply(context, depValues)
                        .then(taskComplete)
                        .catch(handleTaskError);

                    namesUsed.push(main._taskList[index].name);

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

TaskManager.prototype.task = function addTask(name, flag, deps, str){
    this._taskList.push(createTask.apply(this, arguments));
    return this;
};

TaskManager.prototype.include = function include(tmanager){
    if(tmanager instanceof TaskManager){
        tmanager.runCount++;
        this._taskList = this._taskList.concat(tmanager._taskList);
    }

    return this;
};

function createTask(name, flag, deps, fn, priority){

    var useFlag = false;
    if(deps === undefined){
        fn = flag;
        deps = [];
    }else if(fn === undefined){
        fn = deps;

        if(!(useFlag = isFlags(flag)) && isArray(flag)){
            deps = flag;
        }else{
            deps = [];
        }
    }else if(isFlags(flag)){
        useFlag = isFlags(flag);
    }

    if(priority === undefined){
        priority = 2;
        if(useFlag){
            priority = 1;
        }
    }

    if(typeof fn !== 'function'){
        fn = (function(str){
            return function * (){
                console.log(str.toString());
                return str;
            };
        }(fn));
    }

    return {
        name: name,
        useFlag: useFlag,
        flag: flag,
        deps: deps,
        fn: cc(fn),
        priority: priority
    };
}

function getTasks(taskList){
    return taskList.sort(function(a, b){
        if(a.priority < b.priority){ return -1; }
        if(a.priority > b.priority){ return 1; }
        return 0;
    });
}

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
