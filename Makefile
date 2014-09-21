GLOBAL := $(shell find src/global -name '*.js')
JS := $(shell find src/js -name '*.js')
GAMES := $(shell find src/games -name '*.js')

release:
	uglifyjs $(GLOBAL) $(JS) $(GAMES) -m -c -o index_min.js

debug:
	uglifyjs $(GLOBAL) $(JS) $(GAMES) -b -o index_min.js

all: release
	
