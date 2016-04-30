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

If you are running `penumbra` in a browser then the first part of the url path is used instead to auto run a task.

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

### pen.task(name, [dependencies, ...], generator function callback|string)

Set a task. Dependencies are run first. The task name, and dependencies should be:

-	JavaScript string
-	Glob string
-	Regular expression

The last argument should be a generator function, or a string.

Look at [create-coroutine](https://www.npmjs.com/package/create-coroutine) to learn more about what is running the task callbacks in `penumbra`.

### pen.task(name, flag(s), [dependencies, ...], generator function callback|string)

Use a command line flag to filter a task.

The flag argument is optional, and must look like a flag. Ex: `--help`, `-h`.

If you passed a flag to a task you can use multiple tasks with the same name. These multiple tasks will only run when the correct flag is in the command line input.

```javascript
var pen = require('penumbra')();

pen.task('thing', '--main', function * (){
    console.log('Doing the main thing.');
});
pen.task('thing', '--other', function * (){
    console.log('Doing the other thing.');
});
```

If you saved the above in a file named `things.js` running it on the command line as `node thing.js thing --main` will print `Doing the main thing.`.

You can also pass an array of flags. All flags will be required to run the task.

```javascript
pen.task('thing', ['--one', '--two'], function * (){
    console.log('Doing the other thing.');
});
```

If you are running `penumbra` in the browser then query string parameters are used as flags.

### pen.exec(name, ..., name) -> Promise instance

Call `pen.exec` if you want to run a bunch of tasks manually.

If you have any tasks set, and they match the strings you pass to `pen.exec` those tasks will be executed.

If you don't call `pen.exec`:

1.	the penumbra instance will look in `process.argv[2]` for a task when in node or,
2.	in the first of `window.location.pathname` if you're using penumbra in a browser.

Version 1: ~~If you use `pen.exec` without arguments it looks for a process object with argv[2] to execute, or the first value of the path in a url if you have `penumbra` in a webpage.~~

Version 2: `pen.exec` ran without arguments doesn't do anything.

All arguments to `pen.exec` must be strings.

### pen.include(source)

Include another task manager into another.

`source` would be another instance of `penumbra`.

Example:

**other.js**

```javascript
var pen = require('penumbra')();

pen.task('longlog', function * (){
    console.log('loooooooooooooooooooooog!');
});

module.exports = pen;
```

**tasks.js**

```javascript
var pen = require('penumbra')(),
    other = require('./other');

pen.include(other);

pen.task('ready', function * (){
    console.log('ready to log!');
});
pen.task('log', ['ready'], function * (){
    console.log('log log log every one wants a log!');
});
```

You can then use the `longlog` task from tasks.js.

Properties
----------

### pen.tasks

Get a nicely formatted string representing all the tasks.

```javascript
console.log(pen.tasks);
```

Static Properties
-----------------

### require('penumbra').flags

Get the command line flags, or browser query parameters.

### require('penumbra').args

Get an array of the ordered command line arguments, or the path members of a browser url.

Static Methods
--------------

### require('penumbra').runDefault(generator function)

`runDefault` is deprecated so don't use it.

Interesting Effects To Pay Attention To
---------------------------------------

### Regular Expression Tasks

There is a chance that a regular expression task will run twice, or more if you have it as a dependency.

This happens because `pen.exec` uses a pattern matching algorithm instead of just checking equality.

The regex task can run on it's own when matched then have a chance to run again as a dependent.

In the next example the `/b/` task will run twice because it matches the **b** in **build**.

```javascript
pen.task('/b/', function * (){ console.log('omg') });
pen.task('build', [/b/], function * (){ console.log('OMG!') });
pen.exec('build');
```

### Globs

As with regular expressions glob string tasks also have a chance of running twice. There is less of a chance, but it can still happen.

The effects of globs, and regular expressions can be used to leverage dependencies if you're careful about how you write them. With great power comes destructive capabilities. ;)

### Auto Running

If you run your `penumbra` script without calling `pen.exec` a task will be chosen from the command line arguments. To do this there is a timer inside the `penumbra` constructor that will delay the internal call to `pen.exec` until all tasks are set.

If you call `pen.exec` inside another asynchronous function the delay of that timer will not be long enough, and you'll get a chance for `pen.exec` to be called twice. This can happen if both the command line input task, and the input to your `pen.exec` method call share the same name pattern.

In fact you could have infinite recursion from `pen.exec` calls inside of a task callback. Just be aware of where your calling `pen.exec`.

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
