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
    var main = this.main = this;
    this._taskList = [];
    this.tasksComplete = 0;
    this.execError = null;

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

        indexes = getTaskIndexes(main, names);

        return cc.run(function * (){

            var index, returnValues = [];

            for(var n=0; n<indexes.length; n++){
                index = indexes[n];

                returnValues.push(
                    yield cc(main._taskList[index].fn)
                    .call(context)
                    .then(taskComplete)
                    .catch(handleTaskError)
                );
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

    };

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

function getTaskIndexes(main, taskNames){
    var matcher,
        flags = getFlags(),
        flagKeys = Object.keys(flags),
        used = [];

    matcher = new Matcher(
        main._taskList.map(function(task){
            return task.name;
        })
    );

    return taskNames.reduce(function(prev, current){
        return prev.concat(matcher.indexes(current));
    }, []).reduce(function(prev, current){
        if(main._taskList[current].useFlag){
            if(!flagsMatch(flagKeys, main._taskList[current].useFlag)){
                return prev;
            }
        }

        if(indexOf(used, main._taskList[current].name) !== -1){
            return prev;
        }

        used.push(main._taskList[current].name);

        return prev.concat([current]);
    }, []);
}

function createTask(name, flag, fn, priority){
    var useFlag = false, type;

    /*if(type === 'object'){
        type = Object.prototype.toString.call(fn);
    }*/

    if(fn === undefined){
        fn = flag;
        priority = fn;
    }else{
        useFlag = isFlags(flag);
        priority = 1;
    }

    type = typeof fn;

    if(type !== 'function'){
        fn = createStringTask(fn);
    }

    return {
        name: name,
        flag: flag,
        fn: fn,
        useFlag: useFlag,
        priority: isNaN(priority) ? 2 : priority
    };
}

function createStringTask(val){
    return function * (){
        var type = typeof val;
        if(type === 'string'){
            console.log(val);
        }else if(type === 'object'){
            console.log(JSON.stringify(val, null, 2) + '');
        }else{
            console.log(val.toString());
        }
        return val;
    };
}

function prioritizeTasks(taskList){
    return taskList.sort(function(a, b){
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
