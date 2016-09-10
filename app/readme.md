This is the first and fast iteration of the VisAnalyticsKit client.
It's far from perfect and needs some refactoring in the future.

It uses industry standard libraries and frameworks like [Angular.js (v1.*)](https://angularjs.org/), 
[D3.js](https://d3js.org/) and the [Express web-framework](http://expressjs.com/) for Node.js.

#Installation and Requirements

First of all you have to install a recent Node.js version, preferably install the node version manager (nvm) first because it simplifies
the further installation of different Node.js versions. 
Please refer to the [nvm repository](https://github.com/creationix/nvm) for detailed instructions.
We used Node.js v5.0.0 to build this, but it should also work with any later version.
The latest Node.js version at the time of writing is v6.3.1.

Node.js ships with a built-in package manager called "npm".
It's the goto solution for all your Node.js modules and packages you can think of.
npm has a huge repository of available packages found here: https://www.npmjs.com/

We currently make use of the [bower component manager](https://bower.io/) for client-side packages like Angular.js.
This should be replaced by npm in upcoming iterations.


To install the app follow the next instructions:

```bash
# change to working directory
cd /path/to/client-code

# installs server dependencies in a folder called node_modules
npm install

# install the bower manager globally
npm install -g bower 

# check if bower has been successfully installed (optional)
# bower --version

# if everything went okay:
# this installs the front-end components
bower install

```
You have to have the VAKStateKit backend running, either locally or remotely else the next step will definitely fail.

The bin folder contains an executable called www.
Note: If an exception is thrown you currently have to restart the server by re-executing the command.
This behavior is okay for development. For a production or staging env we should rely on a command utility like [forever](https://github.com/foreverjs/forever) or [nodemon](http://nodemon.io/)

```bash
# start the server

node /bin/www
```
