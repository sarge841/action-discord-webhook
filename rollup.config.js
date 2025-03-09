// filepath: /home/jcabrera/vscode/action-discord-notif/rollup.config.js
// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const config = {
  input: 'src/index.js',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    json() // Add the JSON plugin here
  ]
}

export default config
