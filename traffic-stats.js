const github = require('@actions/github');
const core = require('@actions/core');
const fs = require('fs');
const {parse} = require('csv-parse/sync');
const {stringify} = require('csv-stringify/sync');

const csvFilePath = process.env.CSV_FILEPATH;
const gitHubToken = process.env.GITHUB_TOKEN;
const repository_owner = process.env.REPOSITORY_OWNER;
const repository_name = process.env.REPOSITORY_NAME;

async function run({gitHubToken, csvFilePath, repository_owner, repository_name}) {
  const octokit = github.getOctokit(gitHubToken);
  const { data: {views} } = await octokit.rest.repos.getViews({owner: repository_owner, repo: repository_name});

  const csvFileData = fs.existsSync(csvFilePath) ? fs.readFileSync(csvFilePath, 'utf8') : '';
  const records = parse(csvFileData, { columns: true, objname: 'timestamp' });
  
  views.forEach(x => records[x.timestamp] = x);
 
  const recordsForUpdate = Object.keys(records).map(x => records[x]).sort((a,b) => {
    return a.timestamp.localeCompare(b.timestamp);
  });

  const updatedCsvFileData = stringify(recordsForUpdate, {
    header: true, 
    columns: ['timestamp', 'count', 'uniques']
  });

  fs.writeFileSync(csvFilePath, updatedCsvFileData);
}

run({gitHubToken, csvFilePath, repository_owner, repository_name});