penumbra changelog
==================

Only major, or breaking changes will be logged here.

2.0.0
-----

-	Penumbra tasks can now return a value available to dependent tasks as arguments.
-	`pen.exec` without arguments does nothing. The returned promise resolves to `null`.
-	Auto running is more consistent.
-	The `runDefault` static method is deprecated.
-	There is now an options arguments for the `penumbra` constructor factory function with a default option.
