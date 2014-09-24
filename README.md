![Build](https://travis-ci.org/alasdair333/js-the-resistance.svg?branch=master)

js-the-resistance
=================

Javascript based version of the popular game. 

## Building
To install all required node packages

```
npm install
```

### Install & Run
Once all the requirements have been installed you can:

```
./js-the-resistance
```

This will take all the files and merge them into one Uglified script file and run it.

You can also do:

```
make debug
```

This will build a beautified version of the code in one file, should the need to step through code be required. 

### Testing
For testing run the following commands

```
npm test
```

This will build a debug version of the index_min.js, start the node server and run mocha tests. 



