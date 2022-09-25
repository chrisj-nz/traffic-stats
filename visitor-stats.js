import github from '@actions/github';
import fs from 'fs';
import { updateCsvWithLatestViews } from './csv-aggregator.js';

const csvFilePath = process.env.CSV_FILEPATH;
const gitHubToken = process.env.GITHUB_TOKEN;
const repository = process.env.REPOSITORY;
const getViews = github.getOctokit(gitHubToken).rest.repos.getViews;

updateCsvWithLatestViews({fs, getViews, csvFilePath, repository});