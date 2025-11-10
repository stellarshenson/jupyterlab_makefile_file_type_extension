# Test file for debugging string parsing
VERSION := $(shell command -v node >/dev/null 2>&1 && node -p "require('./package.json').version" || echo "0.0.0")
TEST := "simple string"
TEST2 := 'simple single'
TEST3 := "string with 'single' inside"
TEST4 := 'string with "double" inside'
