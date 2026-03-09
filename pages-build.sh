#!/bin/sh
# Cloudflare Pages build script
# Strips optionalDependencies from package.json so wrangler isn't installed during build

node -e "
const pkg = require('./package.json');
delete pkg.optionalDependencies;
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

yarn build
