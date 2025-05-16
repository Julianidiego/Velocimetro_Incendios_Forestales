#!/bin/bash
source ~/.nvm/nvm.sh
nvm use --lts > /dev/null 2>&1
node index.js
