var cc = require('create-coroutine'),
    Matcher = require('multimatcher');

function TaskManager(){
    this._taskList = [];
    this.tasksComplete = 0;
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
            toMatch = [];

        for(i=0; i<self._taskList.length; i++){
            toMatch.push(self._taskList[i].name);
        }

        matcher = new Matcher(toMatch);

        for(i=0; i<names.length; i++){

            if((index = matcher.index(names[i])) !== -1){
                if(self._taskList[index].deps.length){
                    yield self.exec.apply(self, self._taskList[index].deps);
                }

                yield cc.run(self._taskList[index].fn)
                    .then(taskComplete)
                    .catch(handleTaskError);
            }
        }

        function taskComplete(){
            return (++self.tasksComplete);
        }

        function handleTaskError(err){
            throw new Error('Error in penumbra task: '+err.message);
        }

        return self.tasksComplete;
    });
};

/*function TaskManager(){
    this._taskHash = {};
}

TaskManager.prototype.task = function(name, deps, fn){
    if(fn === undefined){
        fn = deps;
        deps = [];
    }

    this._taskHash[name] = {
        fn: fn,
        deps: deps
    };
    return this;
};
TaskManager.prototype.exec = function(){
    "use strict";
    var names = Array.prototype.slice.call(arguments), self = this;
    return cc.run(function * (){

        var toMatch = [],
            matcher;




        for(let i=0; i<names.length; i++){
            if(self._taskHash[names[i]] !== undefined){
                if(self._taskHash[names[i]].deps.length){
                    yield self.exec(self._taskHash[names[i]].deps);
                }

                return cc.run(self._taskHash[names[i]].fn);
            }
        }


    });
};

TaskManager.prototype.execDefault = function(){
    if(this._taskHash['default']){
        return this.exec('default');
    }
};*/

module.exports = TaskManager;
