SOURCES := $(shell find src -name '*.js')

release:
	uglifyjs $(SOURCES) -m -c -o index_min.js

debug:
	uglifyjs $(SOURCES) -b -o index_min.js
	cat index_min.js

all: release
	