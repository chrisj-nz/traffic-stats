const github = require('@actions/github');
const core = require('@actions/core');
const fs = require('fs');
const {parse} = require('csv-parse/sync');
const {stringify} = require('csv-stringify/sync');

async function run() {
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const { data: {views} } = await octokit.rest.repos.getViews({owner:'chrisj-nz', repo:'traffic-stats'});

  const csvFilePath = process.env.CSV_FILEPATH;
  const csvFileData = fs.existsSync(csvFilePath) ? fs.readFileSync(csvFilePath, 'utf8') : '';
  const records = parse(csvFileData, { columns: true, objname: 'timestamp' });
  
  views.forEach(x => records[x.timestamp] = x);
  records['2022-09-22T00:00:00Z'] = {timestamp:"2022-09-22T00:00:00Z",count: 3, uniques: 1};
 
  const recordsForUpdate = Object.keys(records).map(x => records[x]).sort((a,b) => {
    return a.timestamp.localeCompare(b.timestamp);
  });

  const updatedCsvFileData = stringify(recordsForUpdate, {
    header: true, 
    columns: ['timestamp', 'count', 'uniques']
  });

  core.info(`csv: ${updatedCsvFileData}`);

  fs.writeFileSync(csvFilePath, updatedCsvFileData);
}

run();