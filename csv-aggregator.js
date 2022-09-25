import core from '@actions/core';
import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';

export async function updateCsvWithLatestViews({fs, getViews, csvFilePath, repository}) {
    const [repository_owner, repository_name] = repository.split('/');

    core.info(`Reading ${csvFilePath}`);
    const existingCsvData = fs.existsSync(csvFilePath) ? fs.readFileSync(csvFilePath, 'utf8') : '';
    const recordsByDate = parse(existingCsvData, { columns: true, objname: 'date' });

    core.info(`Getting latest visitor views from ${repository_owner}/${repository_name}`);
    const { data: {views} } = await getViews({owner: repository_owner, repo: repository_name});

    const newRecords = views.map(x => {
      return {
        date: x.timestamp.substring(0,10),
        count: x.count,
        uniques: x.uniques
      };
    });
       
    newRecords.forEach(x => recordsByDate[x.date] = x);
    const updatedRecords = Object.keys(recordsByDate).map(x => recordsByDate[x]).sort((a,b) => {
      return a.date.localeCompare(b.date);
    });
  
    const updatedCsvData = stringify(updatedRecords, {
      header: true, 
      columns: ['date', 'count', 'uniques']
    });
  
    core.info(`Writing ${csvFilePath}`);
    fs.writeFileSync(csvFilePath, updatedCsvData);
  }