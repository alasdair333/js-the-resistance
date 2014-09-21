![Build](https://travis-ci.org/alasdair333/js-the-resistance.svg?branch=master)

js-the-resistance
=================

Javascript based version of the popular game. 

## Building

### Requirements

* [NodeJS](http://nodejs.org/)
* [UglifyJS2](https://github.com/mishoo/UglifyJS2)
* make

### Install & Run
Once all the requirements have been installed you can:

```
make
chmod +x ./js-the-resistance
./js-the-resistance
```

This will take all the files and merge them into one Uglified script file ready for running. 

You can also do:

```
make debug
```

This will build a beautified version of the code in one file, should the need to step through code be required. 



