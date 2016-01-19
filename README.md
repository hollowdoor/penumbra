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

Version 2 differences
---------------------

Penumbra tasks can now return a value available to dependent tasks as arguments.

`pen.exec` without arguments does nothing. The returned promise resolves to `null`.

Auto running is more consistent.

The `runDefault` static method is deprecated.

There is now an options arguments for the `penumbra` constructor factory function with a default option.

Documentation
-------------

Visit the [penumbra wiki](https://github.com/hollowdoor/penumbra/wiki/Documentation) for more documentation.

Dependency Results
------------------

`penumbra` version 2 allows you to return a value from a task callback.

Return values are available to tasks that have those other tasks as dependencies.

```javascript
var penumbra = require('penumbra')();

pen.task('ready', function * (){
    console.log('ready to log!');
    return 'Turn it up to ';
});
pen.task('super_ready', function * (){
    return process.argv[3] || 11;
});
pen.task('log', ['ready', 'super_ready'], function * (ready, sup){
    console.log('ok logging!');
    //ready="Turn it up to "
    //sup=process.argv[3], or 11
    console.log(ready + sup + '!');
});
```

Saving the script above as `cmdlog.js`. Running it as `node cmdlog log` prints:

```
ready to log!
ok logging!
Turn it up to 11!
```

Default Task
------------

Setting a default task gives you max control.

```javascript
var pen = require('penumbra')({
        default: 'def'
    });
```

...

```javascript
pen.task('def', function * (){
    console.log('Running the default task.');
});
```

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

Methods
-------

### pen.task(name, [dependencies, ...], generator function callback)

Set a task. Dependencies are run first. The task name, and dependencies should be:

-	JavaScript string
-	Glob string
-	Regular expression

Look at [create-coroutine](https://www.npmjs.com/package/create-coroutine) to learn more about what is running the task callbacks in `penumbra`.

### pen.exec(name, ..., name) -> Promise instance

Call `pen.exec` if you want to run a bunch of tasks manually.

If you have any tasks set, and they match the strings you pass to `pen.exec` those tasks will be executed.

If you don't call `pen.exec`:

1.	the penumbra instance will look in `process.argv[2]` for a task when in node or,
2.	in the first of `window.location.pathname` if you're using penumbra in a browser.

Version 1: ~~If you use `pen.exec` without arguments it looks for a process object with argv[2] to execute, or the first value of the path in a url if you have `penumbra` in a webpage.~~

Version 2: `pen.exec` ran without arguments doesn't do anything.

All arguments to `pen.exec` must be strings.

Properties
----------

### pen.tasks

Get a nicely formatted string representing all the tasks.

```javascript
console.log(pen.tasks);
```

Static Methods
--------------

### require('penumbra').runDefault(generator function)

**deprecated**: The static method runDefault will be removed in a later version.

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

`penumbra` is task agnostic. Use it as a build tool, auto updater, a command line template, or a full program for doing whatever. There's no writing/reading/watch functions, arguments parsing, or anything helpful so get those elsewhere.

Look at [multimatcher](https://www.npmjs.com/package/multimatcher) to find out what kind of names you can use for tasks in `penumbra`. For example you can use these as names:

-	String
-	Regular expression
-	Glob String

Reasons
-------

I just wanted to have a fun way to run scripts that also might be useful. I also like the idea of having a location where I can get this module from almost anywhere so here it is published. Use at your own risk.
