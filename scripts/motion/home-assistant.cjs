#!/usr/bin/env node
// Record the native Home Assistant frontend against an isolated demo backend.
// Set HA_ORIGIN, HA_PRIVATE_DIR, and PLAYWRIGHT_PATH. No real credentials.
const path = require('node:path');
const {execFileSync} = require('node:child_process');
async function render() {
  execFileSync(process.execPath,[path.join(__dirname,'native-home-assistant.mjs')],{
    stdio:'inherit',env:{...process.env,HA_DEMO_RENDER:'1'},
  });
}
module.exports={render};
if(require.main===module)render().catch(error=>{console.error(error.message);process.exitCode=1;});
