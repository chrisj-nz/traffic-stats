import github from '@actions/github';
import fs from 'fs';
import { createCsv } from './traffic-stats-service.js';

const csvFilePath = process.env.CSV_FILEPATH;
const gitHubToken = process.env.GITHUB_TOKEN;
const repository = process.env.REPOSITORY;
const repos = github.getOctokit(gitHubToken).rest.repos;

createCsv({fs, repos, csvFilePath, repository});