const withSass = require('@zeit/next-sass')
const withCSS = require('@zeit/next-css')
const fs = require('fs');
module.exports = withCSS(withSass({
  /* config options here */
  env: {
    googleKey: fs.readFileSync('./env.txt').toString()
  }
}));