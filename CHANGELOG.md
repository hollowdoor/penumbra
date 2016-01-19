penumbra changelog
==================

Only major, or breaking changes will be logged here.

2.1.1
-----

-	Added a `tasks` property which returns a formatted string of tasks.

2.0.0
-----

-	Penumbra tasks can now return a value available to dependent tasks as arguments.
-	`pen.exec` without arguments does nothing. The returned promise resolves to `null`.
-	`pen.exec` called like `pen.exec.call` will work with whatever this context is used.
-	Auto running is more consistent.
-	The `runDefault` static method is deprecated.
-	There is now an options arguments for the `penumbra` constructor factory function with a default option.
