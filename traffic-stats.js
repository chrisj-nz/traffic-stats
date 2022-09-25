import github from '@actions/github';
import fs from 'fs';
import { createCsv } from './traffic-stats-service.js';

const csvFilePath = process.env.CSV_FILEPATH;
const gitHubToken = process.env.GITHUB_TOKEN;
const repository_owner = process.env.REPOSITORY_OWNER;
const repository_name = process.env.REPOSITORY_NAME;
console.log(`repository_name: ${repository_name}`);
const repos = github.getOctokit(gitHubToken).rest.repos;

createCsv({fs, repos, csvFilePath, repository_owner, repository_name});