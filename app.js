#!/usr/bin/env node

const clear = require(`clear`);
const chalk = require(`chalk`);
const figlet = require(`figlet`);
const { file, github } = require(`./lib`);

// clear console and print title
clear();
console.log(
  chalk.yellow(figlet.textSync(`GitHub Init`, { horizontalLayout: `fitted` }))
);

// check to see if this folder has already been initialized as a git repo
if (file.directoryOrFileExists(`.git`)) {
  console.log(chalk.red(`Already a git repo!`));
  process.exit();
}

const run = async () => {
  try {
    // log into GitHub
    await github.login();

    // add necessary files to local repo
    await github.addInitFiles();

    // create a remote repo
    const url = await github.createRemoteRepo();

    // init, commit, and push everything to remote repo
    await github.initAndPush(url);

    console.log(chalk.green(`Repo created!`));
  } catch (err) {
    if (err && err.status) {
      switch (err.status) {
        case 401:
          console.log(chalk.red(`Incorrect credentials.`));
          break;
        case 422:
          console.log(
            chalk.red(
              `There is already a remote repository with the same name.`
            )
          );
          break;
        default:
          console.log(chalk.red(err));
      }
    }
  }
};

run();
