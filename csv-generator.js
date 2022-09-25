import core from '@actions/core';
import {parse} from 'csv-parse/sync';
import {stringify} from 'csv-stringify/sync';

export async function updateCsvWithLatestVisitorStats({fs, getViews, csvFilePath, repository}) {
  const [repository_owner, repository_name] = repository.split('/');
  core.info(`Getting latest visitor stats from ${repository_owner}/${repository_name}`);
  const { data: {views} } = await getViews({owner: repository_owner, repo: repository_name});

  core.info(`Reading ${csvFilePath}`);
  const existingCsvData = fs.existsSync(csvFilePath) ? fs.readFileSync(csvFilePath, 'utf8') : '';

  core.info('Generating updated csv data');
  const updatedCsvData = getUpdatedCsvData(views, existingCsvData);
  
  core.info(`Writing ${csvFilePath}`);
  fs.writeFileSync(csvFilePath, updatedCsvData);
}

const getUpdatedCsvData = (views, existingCsvData) => {
  const recordsByDate = parse(existingCsvData, { columns: true, objname: 'date' });
  const newRecords = views.map(view => {
    return {
      date: view.timestamp.substring(0,10),
      count: view.count,
      uniques: view.uniques
    };
  });
      
  newRecords.forEach(x => recordsByDate[x.date] = x);
  const updatedRecords = Object.keys(recordsByDate).map(x => recordsByDate[x]).sort((a,b) => {
    return a.date.localeCompare(b.date);
  });

  const updatedCsvData = stringify(updatedRecords, { header: true, columns: ['date', 'count', 'uniques']});
  return updatedCsvData;
}