SOURCES := $(shell find src -name '*.js')

release:
	./node_modules/.bin/uglifyjs $(SOURCES) -m -c -o index_min.js

debug:
	./node_modules/.bin/uglifyjs $(SOURCES) -b -o index_min.js

all: release
	