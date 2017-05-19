csam-api
==========

A simple library for building model-driven APIs.

Very alpha and still messy.

# Features

* Configuration-driven
* Supports arbitrary Mongoose models, integrates with the database and auto-generates all routes
* Supports passport.js for authentication
* Supports Redis for session storage
* Support role-based access control for all models

# Example

There is a simple example API in the `example` directory that manages cats. Since it requires MongoDB and Redis, there is a shell script `run.sh` for starting all of this up (requires Docker).

# License: MIT
