import core from '@actions/core';
import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';

export async function createCsv({fs, repos, csvFilePath, repository_owner, repository_name}) {
    core.info('Retrieving views');
    const { data: {views} } = await repos.getViews({owner: repository_owner, repo: repository_name});
  
    core.info(`Reading ${csvFilePath}`);
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
  
    core.info(`Writing ${csvFilePath}`);
    fs.writeFileSync(csvFilePath, updatedCsvFileData);
  }