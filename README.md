WebGnomeClient
==============
[![build status](https://ci.orr.noaa.gov/projects/2/status.png?ref=master)](https://ci.orr.noaa.gov/projects/2?ref=master)

Javascript client that uses the WebGnomeAPI to create and run py_gnome models.

## Setup
[Node.js](http://nodejs.org/) and [npm](https://www.npmjs.org/) are required to install and manage this application. Assuming both are installed on your system a simple `npm install` from inside the `WebGnomeClient` directory should install and prep everything for the app.

As of 05/27/2014 the `WebGnomeClient` requires that `WebGnomeApi` be running on the same computer you're loading the client. Specifically port `9899`.

## Commands
<dl>
    <dt>npm install</dt>
    <dd>Installs all of the applications dependencies described in `package.json` using npm and `bower.json` using bower</dd>
</dl>

<dl>
    <dt>npm start</dt>
    <dd>Compiles the backbone application into `js/build.js` and starts a node http server to serve the application. *Currently `js/build.js` isn't referenced by anything and start it just used to build it, this needs reevaluation.*
<dl>


