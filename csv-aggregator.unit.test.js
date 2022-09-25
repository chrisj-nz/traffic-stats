import { updateCsvWithLatestViews } from './csv-aggregator.js';

it('creates a new csv file sorted by date', async () => {
    const csvFilePath = 'csvFilePath';
    const fs = {
        contents: undefined,
        existsSync: () => false,
        readFileSync: () => { throw 'file not exists' },
        writeFileSync: function(path, data) {
            if (path === csvFilePath) this.contents = data
        } 
    };

    const repository_owner = 'repository_owner';
    const repository_name = 'repository_name';
    const repository = `${repository_owner}/${repository_name}`;
    const getViews = async ({owner, repo}) => {
        const views = [
            {timestamp: '2022-09-24T00:00:00Z', count: 149, uniques: 1},
            {timestamp: '2022-09-23T00:00:00Z', count: 12, uniques: 2},
        ];
        return (owner === repository_owner && repo === repository_name) ? {data: { views }} : undefined;
    };
    
    const expectedCsv = 'date,count,uniques\n'
        + '2022-09-23,12,2\n'
        + '2022-09-24,149,1\n';

    await updateCsvWithLatestViews({fs, getViews, csvFilePath, repository});

    expect(fs.contents).toBe(expectedCsv);
  });

  it('updates existing csv file with new and updated rows sorted by date', async () => {
    const csvFilePath = 'csvFilePath';
    const fs = {
        contents: 'date,count,uniques\n'
            + '2022-09-23,12,1\n'
            + '2022-09-24,149,1\n',
        existsSync: () => true,
        readFileSync: function() { return this.contents },
        writeFileSync: function(path, data) {
            if (path === csvFilePath) this.contents = data
        } 
    };

    const repository_owner = 'repository_owner';
    const repository_name = 'repository_name';
    const repository = `${repository_owner}/${repository_name}`;
    const getViews = async ({owner, repo}) => {
        const views = [
            {timestamp: '2022-09-24T00:00:00Z', count: 150, uniques: 2},
            {timestamp: '2022-09-26T00:00:00Z', count: 26, uniques: 3},
            {timestamp: '2022-09-25T00:00:00Z', count: 25, uniques: 4},
        ];
        return (owner === repository_owner && repo === repository_name) ? {data: { views }} : undefined;
    };

    const expectedCsv = 'date,count,uniques\n'
        + '2022-09-23,12,1\n'
        + '2022-09-24,150,2\n'
        + '2022-09-25,25,4\n'
        + '2022-09-26,26,3\n';

    await updateCsvWithLatestViews({fs, getViews, csvFilePath, repository});
    
    expect(fs.contents).toBe(expectedCsv);
  });