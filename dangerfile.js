import { danger, fail, markdown, message } from 'danger'
const istanbulCoverage = require('danger-plugin-istanbul-coverage').istanbulCoverage
import jiraIssue from 'danger-plugin-jira-issue'
import * as fs from 'fs'
import * as path from 'path'

const getEslintMarkdown = (eslintOutput, newFiles, modifiedFiles) => {
  let eslintMarkdown = '## ESlint Issues:\n'
  let warnings = false

  eslintOutput.map(record => {
    const file = path.parse(record.filePath).base

    if (modifiedFiles.includes(file) || newFiles.includes(file)) {
      if (record.messages.length > 0) {
        warnings = true
        eslintMarkdown = eslintMarkdown.concat(file).concat('\n')
        record.messages.map(error => {
          eslintMarkdown = eslintMarkdown.concat(
            `* ${error.ruleId} - ${error.message} Line ${error.line} \n`
          )
        })
      }
      eslintMarkdown = eslintMarkdown.concat('\n')
    }
  })

  if (warnings) {
    return eslintMarkdown
  } else {
    return ''
  }
}

const existsChangelog = fs.existsSync('CHANGELOG.md')

if (!existsChangelog) {
  fail('Create a changelog file following the instructions of [KeepaChangelog](https://keepachangelog.com/en/1.0.0/)')
} else {
  const hasChangelogModified = danger.git.modified_files.includes('CHANGELOG.md')

  if (!hasChangelogModified) {
    fail('Please add a changelog entry for your changes and follow the instructions of [KeepaChangelog](https://keepachangelog.com/en/1.0.0/)')
  }
}


if (process.env['COVERAGE']) {
  istanbulCoverage({
    customSuccessMessage: 'Congrats, coverage is good',
    customFailureMessage: 'Coverage is a little low, take a look',
    coveragePath: 'coverage/coverage-summary.json',
    reportFileSet: 'createdOrModified',
    reportMode: 'warn'
  })
}


if (process.env['JIRA_TAG'] !== '') {
  jiraIssue({
    key: process.env['JIRA_TAG'],
    url: process.env['JIRA_URL'],
    emoji: ':paperclip:',
    location: 'title'
  })
}


if (process.env['ESLINT']) {
  const eslintOutput = JSON.parse(fs.readFileSync('eslint.json', 'utf8'))

  if (danger.git.modified_files.length > 0 || danger.git.created_files.length > 0) {
    const modifiedFiles = danger.git.modified_files.map(pathname => {
      return path.parse(pathname).base
    })

    const newFiles = danger.git.created_files.map(pathname => {
      return path.parse(pathname).base
    })

    const messageToSend = getEslintMarkdown(eslintOutput, newFiles, modifiedFiles)

    if (messageToSend !== '') {
      markdown(messageToSend)
    } else {
      message('There aren\'t eslint errors in your code :rocket:')
    }
  }
}
