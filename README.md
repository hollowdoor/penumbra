penumbra
========

![penumbra logo](images/logo.png)

Install
-------

### locally

`npm install --save penumbra`

Build a script then run it with: `node myscript.js taskname`

#### Install version 2 (the latest is 3)

`npm install --save penumbra@2.2.2`

View **version2docs**, and the change log on the github repo.

### globally

`penumbra` is a local package only. To install globally build your script using penumbra, and install your script globally `npm install -g ./my-wonderous-world-conqueror`.

And don't forget the first line in your script should be `#!/usr/bin/env node` so your script will work in a Unix environment. Also use `process.cwd()` to get the current working directory any where you run a global script. Easy as pie.

Version 3
---------

Here are some things you should be aware of when upgrading to penumbra version 3:

-	No dependency argument in `task` method
-	Flag argument replaces the dependency argument
-	Tasks run in parallel

There are other changes that are not that big of a deal.

There might be some documentation bugs. So watch out.

Basic Usage
-----------

### Auto Run

```javascript
var penumbra = require('penumbra'),
    args = penumbra.args,
    pen = penumbra();

pen.task('ready', function * (){
    console.log('ready to log!');
    //Use a command line arg or something else.
    return arg[1] || 'log log log every one wants a log!';
});
pen.task('log', function * (){
    //The next line is how you would get a dependency.
    console.log(yield pen.exec('ready')[0]);
});
```

Save that as `log.js` then run it as `node path/to/log.js log`.

### With a flag

You can use command line flags on tasks. Tasks with flags will run instead of tasks without flags that have the same name.

Multiple tasks can be defined with different flags.

To use a cmd flag add to your `log.js` file:

```javascript
pen.task('log', '--help', function * (){
    console.log('Log some stuff. You know you want to.');
});
```

Or:

```javascript
pen.task('log', '--help', 'Log some stuff. You know you want to.');
```

Constructor
-----------

### penumbra(options) -> pen

#### options.default

The default is the task you want to run when you haven't passed one to the command line. The default for `default` is `undefined`.

#### options.autoRun

Allow penumbra to run without calling `pen.exec` yourself. The default for `autoRun` is `true`.

Methods
-------

### pen.task(name, task) -> this

Define a task.

`name` is the name of the task as a string, glob pattern, regular expression.

`task` is a generator function, or string value.

**Version 3 of penumbra does not have a dependency argument.**

### pen.task(name, flag, task) -> this

Define a task that uses a flag. This works the same as a normal task, but a task set this way will use a flag set on the command line.

Multiple tasks with the same name, but different flag can be set.

`flag` must look like a flag (ex: `--help`, `-h`), and can also be an array of flags of the same format.

When `exec` is run, or your script auto runs penumbra if the flag isn't passed to the command line, or it doesn't match exactly the flag belonging to a task that task will not run. **In other words flags set on a task are required to run a task.**

There are no defaults for flags. penumbra only checks if a given flag exists.

### pen.exec(name, ...) -> promise

Execute a task, or several tasks in parallel.

```javascript
pen.exec('one');
pen.exec('first', 'second', 'third');
```

**Calling `pen.exec` will prevent task auto running.**

#### promise returned from exec

The returned promise resolves to an array of return values from the tasks ran with `exec`.

Using ES2015:

```javascript
pen.task('log', function * (){
    //The next line is how you would get a dependency.
    let [str] = yield pen.exec('ready');
    console.log(str);
});
```

### pen.include(pen) -> this

Include the tasks from another instance of penumbra.

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
var penumbra = require('penumbra'),
    args = penumbra.args,
    pen = penumbra(),
    other = require('./other');

pen.include(other);

pen.task('ready', function * (){
    console.log('ready to log!');
});
pen.task('log', function * (){
    yield pen.exec('ready');
    console.log(args[1] || 'log log log every one wants a log!');
});
```

You can then use the `longlog` task from tasks.js.

### pen.callback() -> function

Create a callback to be used in some event emitter.

**`pen.callback` is experimental**

Properties
----------

### pen.tasks

Get a nicely formatted string representing all the tasks.

Static Properties
-----------------

### penumbra.args

Get the ordered command line arguments as an array.

In the browser this will the url path parts.

### penumbra.flags

Get command line flags as an object.

In the browser this will be query parameters.

You get what you pass with `penumbra.flags`. There are no defaults.

```javascript
console.log(pen.tasks);
```

The Alteratives
---------------

-	[./task.js](https://gist.github.com/substack/8313379)
-	[npm scripts](https://docs.npmjs.com/misc/scripts)
-	[gulp](https://www.npmjs.com/package/gulp)

In many situations you'll want to use npm scripts in package.json. If you want something more complex, custom, or distributed then a task runner might be your bag.

About
-----

`penumbra` is task agnostic. Use it as a build tool, auto updater, a command line template, or a full program for doing whatever.

Look at [multimatcher](https://www.npmjs.com/package/multimatcher) to find out what kind of names you can use for tasks in `penumbra`. For example you can use these as names:

-	String
-	Regular expression
-	Glob String

Reasons
-------

I just wanted to have a fun way to run scripts that also might be useful. I also like the idea of having a location where I can get this module from almost anywhere so here it is published. Use at your own risk.
