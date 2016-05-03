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
    this.tasksStarted = [];
    this.runCount = 0;
    this.execError = null;
    this._flagUsed = false;

    this.exec = function exec(){
        var names = Array.prototype.slice.call(arguments),
            context = this,
            indexes;

        if(!names.length) return Promise.resolve(null);

        for(var i=0; i<names.length; i++){
            if(typeof names[i] !== 'string'){
                return Promise.reject(new TypeError(names[i] + ' is not a string.'))
            }
        }

        main._taskList = prioritizeTasks(main._taskList);

        //console.log(getTaskIndexes(main, names))

        indexes = getTaskIndexes(main, names);

        //console.log(indexes)

        //main.tasksStarted = indexes.length;

        return cc.run(function * (){

            var index, depValues, returnValues = [];

            for(var n=0; n<indexes.length; n++){
                index = indexes[n];

                /*if(main._taskList[index].deps.length){
                    depValues = yield main.exec.apply(
                        context,
                        main._taskList[index].deps
                    );
                }*/

                value = yield main._taskList[index].fn
                    .apply(context, depValues)
                    .then(taskComplete)
                    .catch(handleTaskError);

                returnValues.push(value);
            }

            return returnValues;

            function taskComplete(value){
                ++main.tasksComplete;
                return value;
            }

            function handleTaskError(err){
                throw new Error('Error in penumbra task: '+err.message);
            }

        });

        function getTaskIndexes(main, taskNames){
            var matcher, toMatch, indexes,
                flags = getFlags(),
                flagKeys = Object.keys(flags);

            toMatch = main._taskList.map(function(task){
                return task.name;
            });

            matcher = new Matcher(toMatch);

            indexes = taskNames.reduce(function(prev, current){
                //console.log(current)
                return prev.concat(matcher.indexes(current));
            }, []);

            indexes = indexes.reduce(function(prev, current){
                if(main._taskList[current].useFlag){

                    if(main._flagUsed){
                        return prev;
                    }

                    if(flagsMatch(flagKeys, main._taskList[current].useFlag)){
                        main._flagUsed = true;
                        return prev.concat([current]);
                    }
                }

                return prev.concat([current]);
            }, []);

            return indexes;
        }

    };
    /*
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

        main._taskList = prioritizeTasks(main._taskList);

        var names = Array.prototype.slice.call(arguments),
            context = this,
            amount = 0,
            flags = getFlags(),
            flagKeys = Object.keys(flags),
            namesUsed = [];

        main.runCount++;




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
    };*/

    Object.defineProperty(main, 'tasks', {
        get: function(){
            return taskString(main);
        }
    });
}

TaskManager.prototype.task = function addTask(name, flag, fn, priority){
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

function createTask(name, flag, fn, priority){
    var useFlag = false;

    if(fn === undefined){
        fn = flag;
        priority = fn;
    }else{
        useFlag = isFlags(flag);
    }

    if(typeof fn !== 'function'){
        fn = (function(val){

            return function * (){
                var str;
                try{
                    str = JSON.stringify(val);
                }catch(e){
                    str = val.toString();
                }
                console.log(str);
                return val;
            };
        }(fn));
    }

    return {
        name: name,
        flag: flag,
        fn: fn,
        useFlag: useFlag,
        priority: isNaN(priority) ? -1 : priority
    };
}

function createTask1(name, flag, deps, fn, priority){

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

function prioritizeTasks(taskList){
    return taskList.sort(function(a, b){
        //if(a.priority < 0 || a.priority > b.priority){ return 1; }
        if(a.priority > b.priority){ return 1; }
        if(a.priority < b.priority){ return -1; }

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
