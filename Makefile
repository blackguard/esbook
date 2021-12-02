.PHONY: all
all: start


######################################################################

SHELL = /bin/bash
MAKEFLAGS += --no-print-directory

BUILDDIR = ./build


######################################################################
# build rules

.DEFAULT: all

.PHONY: clean
clean:
	@-rm -fr $(BUILDDIR) >/dev/null 2>&1 || true

.PHONY: full-clean
full-clean: clean
	@-rm -fr ./node_modules >/dev/null 2>&1 || true

./node_modules: ./package.json
	npm install

$(BUILDDIR)/package-bundle.js: ./src/package-bundle/*
	@( cd ./src/package-bundle && make )

.PHONY: build
build: ./node_modules $(BUILDDIR)/package-bundle.js

.PHONY: lint
lint: ./node_modules
	./node_modules/.bin/eslint src

.PHONY: start
start: build
	chromium ./src/index.html
