#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const concat = require('concat');
const fs = require('fs');
const path = require('path');
const args = require('args');
const git = require('simple-git');
const glob = require('glob');
const isOnline = require('is-online');

inquirer.registerPrompt('search-checkbox', require('inquirer-search-checkbox'));

function init() {
	const title = fs.readFileSync(path.join(__dirname, 'title.txt'));
	console.log(
		chalk.white('\n' + title + '\n')
	);
}

async function updateTemplates() {
	if (!(await isOnline())) return;

	console.log(
		chalk.blue('Updating templates...')
	);

	if (!fs.existsSync('gitignore')) git().clone('https://github.com/github/gitignore', path.join(__dirname, 'gitignore'));
	else git(path.join(__dirname, 'gitignore')).pull();

	glob(path.join(__dirname, 'gitignore/**/*.gitignore'), (err, files) => {
		for (let file of files) {
			fs.copyFileSync(file, path.join('templates', path.basename(file)));
		}
	});
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

function parseArgs() {
	const config = {
		name: 'ignore',
		mainColor: 'white'
	};

	return args.parse(process.argv, config);
}

(async () => {
	// parse arguments
	const flags = parseArgs();

	// show script introduction
	init();

	// update templates
	await updateTemplates();

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
})();