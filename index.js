const core = require('@actions/core');
const github = require('@actions/github');
const cp = require('child_process')

try {
  process.env['JIRA_TAG'] = core.getInput('JiraTag')
  cp.execSync("npm danger")
  
} catch (error) {
  core.setFailed(error.message);
}