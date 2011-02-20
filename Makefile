EMILE = emile.js
EMILE_MIN = emile.min.js

PHONY: compress

compress:
	@vendor/UglifyJS/bin/uglifyjs -nc $(EMILE) > $(EMILE_MIN)