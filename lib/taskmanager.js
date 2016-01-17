var cc = require('create-coroutine'),
    Matcher = require('multimatcher');

function TaskManager(){
    this._taskList = [];
    this.tasksComplete = 0;
    this.runCount = 0;
}

TaskManager.prototype.task = function(name, deps, fn){
    if(fn === undefined){
        fn = deps;
        deps = [];
    }

    this._taskList.push({
        fn: fn,
        deps: deps,
        name: name
    });
};

TaskManager.prototype.exec = function(){
    var names = Array.prototype.slice.call(arguments),
        self = this,
        amount = 0;

    this.runCount++;
    return cc.run(function * (){
        var matcher, index, i,
            toMatch = [],
            value, returnValues = [], depValues;

        for(i=0; i<self._taskList.length; i++){
            toMatch.push(self._taskList[i].name);
        }

        matcher = new Matcher(toMatch);

        for(i=0; i<names.length; i++){

            if((index = matcher.index(names[i])) !== -1){
                if(self._taskList[index].deps.length){
                    depValues = yield self.exec.apply(self, self._taskList[index].deps);
                }

                value = yield cc(self._taskList[index].fn)
                    .apply(self, depValues)
                    .then(taskComplete)
                    .catch(handleTaskError);

                returnValues.push(value);
            }
        }

        function taskComplete(value){
            ++self.tasksComplete;
            return value;
        }

        function handleTaskError(err){
            throw new Error('Error in penumbra task: '+err.message);
        }

        return returnValues;
    });
};

module.exports = TaskManager;
