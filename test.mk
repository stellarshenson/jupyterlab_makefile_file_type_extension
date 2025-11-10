# Test file for debugging string parsing

VERSION := $(shell command -v node >/dev/null 2>&1 && node -p "require('./package.json').version" || echo "0.0.0")
# how it is displayed:
# lightblue: VERSION := 
# white: $(shell command -v node >/dev/null 2>&1 && node -p "require(
# green: './package.json'
# white: ).version
# green: " || echo "
# white: 0.0.0
# green: ")


TEST := "simple string"
# how it is displayed:
# lightblue: TEST := 
# white: "simple string
# green: "


TEST2 := 'simple single'
TEST3 := "string with 'single' inside"
TEST4 := 'string with "double" inside'


## build packages
build: clean increment_version check_dependencies
	npm install
	yarn install
	python -m build