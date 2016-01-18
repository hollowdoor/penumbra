var cc = require('create-coroutine'),
    Matcher = require('multimatcher');

function TaskManager(){
    var main = this;
    this._taskList = [];
    this.tasksComplete = 0;
    this.runCount = 0;

    this.exec = function exec(){

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

module.exports = TaskManager;
