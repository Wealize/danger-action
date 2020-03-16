import * as core from '@actions/core'
import * as cp from 'child_process'

async function run() {
  try {
    process.env['JIRA_TAG'] = core.getInput('JiraTag')
    cp.execSync("npm run danger")

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()