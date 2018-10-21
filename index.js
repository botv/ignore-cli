#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const concat = require('concat');
const fs = require('fs');
const path = require('path');

inquirer.registerPrompt('search-checkbox', require('inquirer-search-checkbox'));

function init() {
    const title = fs.readFileSync(path.join(__dirname, 'title.txt'));
    console.log(
        chalk.white('\n' + title + '\n')
    );
}

function askQuestions() {
    const questions = [
        {
            type: 'search-checkbox',
            name: 'files',
            message: 'Which gitignores would you like to use?',
            choices: fs.readdirSync(path.join(__dirname, 'templates')).map(x => x.replace('.gitignore', ''))
        },
        {
            type: 'confirm',
            name: 'confirmation',
            message: `Create .gitignore file in ${process.cwd()}?`
        }
    ];
    return inquirer.prompt(questions);
}

function success() {
    console.log(
        chalk.green.bold(`Created .gitignore file in ${process.cwd()}`)
    );
}

async function run() {
    // show script introduction
    init();

    // ask questions
    const answers = await askQuestions();
    const {files, confirmation} = answers;

    if (confirmation) {
        concat(files.map(x => path.join(__dirname, 'templates', x + '.gitignore')))
            .then((result) => {
                fs.writeFileSync(`${process.cwd()}/.gitignore`, result);
            });

        // show success message
        success();
    }
}

run();