penumbra
========

![penumbra logo](images/logo.png)

Install
-------

### locally

`npm install --save penumbra`

Build a script then run it with: `node myscript.js taskname`

### globally

`penumbra` is a local package only. To install globally build your script using penumbra, and install your script globally `npm install -g ./my-wonderous-world-conqueror`.

And don't forget the first line in your script should be `#!/usr/bin/env node` so your script will work in a Unix environment. Also use `process.cwd()` to get the current working directory any where you run a global script. Easy as pie.

Basic Usage
-----------

### Auto Run

```javascript
var pen = require('penumbra')();

pen.task('ready', function * (){
    console.log('ready to log!');
});
pen.task('log', ['ready'], function * (){
    console.log('log log log every one wants a log!');
});
```

Save that as `log.js` then run it as `node path/to/log.js log`.

The `log` at the end is the task you want to run. If you are unfamiliar with task runners programatic **tasks** are typically like events that listen for an argument on the command line. And sometimes *tasks* are emitted from other *tasks*, or from the program proper.

### Manual Run

Add this code to manually programmatically execute a task:

```javascript
pen.exec('log').then(function(){
    console.log('all done');
});
```

If you run `exec` yourself then the auto execution won't go. Please go to the [Mozilla dev promise docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to learn more about Promises, or if you need a refresher on them.

### Run a nested task

```javascript
var pen = require('penumbra')();
var fs = require('fs');
pen.task('nested', function * (){
    //If process.argv[3] = 'nested' then something happens here.
    console.log('Okay then?');
    let stuff = yield new Promise(function(resolve, reject){
        fs.readFile('somefile', 'utf8', function(err, str){
            resolve(str);
        });
    });

    console.log('Why are you reading my '+stuff+'?');
});
pen.task('log', ['ready'], function * (){
    console.log('log log log every one wants a log!');
    pen.exec(process.argv[3]);
});
```

Use vinyl-fs to take over the world
-----------------------------------

```javascript
var pen = require('penumbra')();
var map = require('map-stream');
var fs = require('vinyl-fs');

var log = function(file, cb) {
  console.log(file.path);
  cb(null, file);
};
//The original example from the vinyl-fs docs.
//fs.src(['./js/**/*.js', '!./js/vendor/*.js'])
//  .pipe(map(log))
//  .pipe(fs.dest('./output'));

pen.task('vinyl', function * (){
    yield [
        fs.src(['./js/**/*.js', '!./js/vendor/*.js']),
        map(log),
        fs.dest('./output')
    ];
});
```

Methods
-------

### pen.task(name, [dependencies, ...], generator function callback)

Set a task. Dependencies are run first.

### pen.exec(name, ..., name) -> Promise instance

Execute a bunch of tasks. Use this function if you want to run a bunch of tasks, or for some reason you want a task runner as a webpage (maybe for remote tasks?). :)

If you use `pen.exec` without arguments it looks for a process object with argv[2] to execute, or the first value of the path in a url if you have `penumbra` in a webpage.

Static Methods
--------------

### require('penumbra').runDefault(generator function)

Run a function when there are is no task named in the command line arguments.

If you are specifying your own tasks with the `exec` method you shouldn't need to use `runDefault`. In that instance you may want to use your own checks using a command line parser like [yargs](https://www.npmjs.com/package/yargs), or just check for `process.argv[2]`.

Or perhaps you would like to run `exec` from `runDefault`. Whatever works!

The Alteratives
---------------

-	[./task.js](https://gist.github.com/substack/8313379)
-	[npm scripts](https://docs.npmjs.com/misc/scripts)
-	[gulp](https://www.npmjs.com/package/gulp)

In many situations you'll want to use npm scripts in package.json. If you want something more complex, custom, or distributed then a task runner might be your bag.

About
-----

Look at [create-coroutine](https://www.npmjs.com/package/create-coroutine) to learn more about what is running the task callbacks in `penumbra`.

`penumbra` is task agnostic. Use it as a build tool, auto updater, a command line template, or a full program for doing whatever. There's no writing/reading/watch functions, arguments parsing, or anything helpful so get those elsewhere.

Look at [multimatcher](https://www.npmjs.com/package/multimatcher) to find out what kind of names you can use for tasks in `penumbra`. For example you can use these as names:

-	String
-	Regular expression
-	Glob String

Reasons
-------

I just wanted to have a fun way to run scripts that also might be useful. I also like the idea of having a location where I can get this module from almost anywhere so here it is published. Use at your own risk.
