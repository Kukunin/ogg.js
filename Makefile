build/libogg.js:
	./compileOgg.sh

libogg: build/libogg.js

browser: src/*.js build/libogg.js
	mkdir -p build/
	./node_modules/.bin/browserify \
		--transform browserify-shim \
		--noparse build/libogg.js \
		. \
		> build/ogg.js

clean:
	cd ogg && make clean
	rm -f ogg/configure
	rm -rf build

.PHONY: libogg browser clean
