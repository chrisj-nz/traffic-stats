import github from '@actions/github';
import fs from 'fs';
import { updateCsvWithLatestVisitorStats } from './csv-generator.js';

const csvFilePath = process.env.CSV_FILEPATH;
const repository = process.env.GITHUB_REPOSITORY;
const gitHubToken = process.env.GITHUB_TOKEN;
const getViews = github.getOctokit(gitHubToken).rest.repos.getViews;

updateCsvWithLatestVisitorStats({fs, getViews, csvFilePath, repository});