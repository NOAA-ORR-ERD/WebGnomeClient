WebGnomeClient
==============
[![build status](https://ci.orr.noaa.gov/projects/2/status.png?ref=master)](https://ci.orr.noaa.gov/projects/2?ref=master)

Javascript client that uses the WebGnomeAPI to create and run py_gnome models. Instructions on how to setup a WebgnomeAPI server and OilLibraryAPI server can be found here [API Setup](API_SETUP.md)

## System Requirments
* [Node.js](http://nodejs.org/)
* [npm](http://www.npmjs.org/)
* grunt-cli
* Some form of http server, webroot set to `./dist/build` and directory index set to `build.html` (created after running `grunt build`)

## Commands
`npm install`
> Installs all of the applications dependencies described in `package.json`. Calls `grunt install` upon completion.

`grunt install`
> Installs all client side dependancies from bower.

`grunt develop`
> Sets up a working development environment by reinstalling client side dependancies, compiling less files, starting a http server on port 8080, and setting up a watch task for the less to recompile on change.

`grunt build`
> Builds a compiled version of the application into a single index.html file (marginally supported currently, still has a few external image and font dependancies that are relatively pathed) located in `./dist/build/`.

`grunt build:lite`
> Simpler version of `grunt build`, sets up the applcation for requirejs based dynamic builds.

`grunt serve`
> Starts a http server on port 8080 for serving dynamic builds.

`grunt docs`
> Generate JSDoc based documentation. Located in `./dist/docs`.

`grunt lint`
> Runs jshint over application source files

`grunt test`
> Runs jshint over application source files, followed by a series of selenium tests. (Only works if you have a working client on your system running at `http://localhost:8080`).

`grunt test:demos`
> Similar to `grunt test` but only runs use case specific demo tests.
