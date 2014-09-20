SOURCES := $(shell find src -name '*.js')

release:
	uglifyjs $(SOURCES) -o index_min.js

debug:
	uglifyjs $(SOURCES) -b -o index_min_debug.js

all: release
	