EMILE = emile.js
EMILE_MIN = emile.min.js

PHONY: compress clean

compress: vendor/UglifyJS/bin/uglifyjs
	@vendor/UglifyJS/bin/uglifyjs -nc $(EMILE) > $(EMILE_MIN)

vendor/UglifyJS/bin/uglifyjs:
	git submodule update --init

clean:
	@rm $(EMILE_MIN)
	@for i in `git submodule status | awk '{ print $$2 }'`; do rm -Rf $$i; done