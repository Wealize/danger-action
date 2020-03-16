import * as core from '@actions/core'
import * as cp from 'child_process'
import { danger, fail, markdown, message } from 'danger'
import { istanbulCoverage } from 'danger-plugin-istanbul-coverage'
import jiraIssue from 'danger-plugin-jira-issue'
import * as fs from 'fs'
import * as path from 'path'

async function run() {
  try {
    process.env['JIRA_TAG'] = core.getInput('jira-tag')
    process.env['JIRA_URL'] = core.getInput('jira-url')
    process.env['COVERAGE'] = core.getInput('coverage')
    process.env['ESLINT'] = core.getInput('eslint')

    if (process.env['COVERAGE']) {
      cp.execSync('npm run coverage')
    }

    if (process.env['ESLINT']) {
      cp.execSync('npm run eslint')
    }

    cp.execSync('npm run danger')

  } catch (error) {
    core.setFailed(error.message);
  }
}

run()