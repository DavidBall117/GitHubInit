const Spinner = require(`clui`).Spinner;
const fs = require(`fs`);
const touch = require(`touch`);
const _ = require(`lodash`);
const git = require(`simple-git/promise`)();
const Octokit = require(`@octokit/rest`);
const { createBasicAuth } = require(`@octokit/auth-basic`);

const Configstore = require(`configstore`);
const pkg = require(`../package.json`);
const confStore = new Configstore(pkg.name);

const cli = require(`./cli`);

let octokit;

const login = async () => {
  const storedToken = confStore.get(`githubinit.token`);
  if (storedToken) {
    octokit = new Octokit({
      auth: storedToken,
    });
    return storedToken;
  }

  const credentials = cli.askUserCredentials(`GitHub`);

  const status = new Spinner(`Authenticating with GitHub, please wait . . .`);
  status.start();

  const authData = {
    username: credentials.username,
    password: credentials.password,
    async on2Fa() {
      // TODO
    },
    token: {
      scopes: [`user`, `public_repo`, `repo`, `repo:status`],
      note: `GitHubInit, command line tool for initializing Git repos.`,
    },
  };

  try {
    const auth = createBasicAuth(authData);
    const res = await auth();
    if (res.token) {
      confStore.set(`githubinit.token`, res.token);
      octokit = new Octokit({
        auth: res.token,
      });
      return res.token;
    } else {
      throw new Error(`GitHub token was not found in the reponse.`);
    }
  } finally {
    status.stop();
  }
};

const addInitFiles = async () => {
  // add .gitignore file
  const fileList = _.without(fs.readdirSync(`.`), `.git`, `.gitignore`);
  if (fileList.length) {
    const answers = await cli.askIgnoreFiles(fileList);
    if (answers.ignore.length) {
      fs.writeFileSync(`.gitignore`, answers.ignore.join(`\n`));
    } else {
      touch(`.gitignore`);
    }
  } else {
    touch(`.gitignore`);
  }
};

const createRemoteRepo = async () => {
  const answers = await cli.askRepoDetails();
  const data = {
    name: answers.name,
    description: answers.description,
    private: answers.visibility === `private`,
  };

  const status = new Spinner(`Creating remote repository . . .`);
  status.start();

  try {
    const response = await octokit.repos.createForAuthenticatedUser(data);
    return response.data.ssh_url;
  } finally {
    status.stop();
  }
};

const initAndPush = async (url) => {
  const status = new Spinner(
    `Initializing local repository and pushing to remote . . .`
  );
  status.start();
  try {
    git
      .init()
      .then(git.add(`.gitignore`))
      .then(git.add(`./*`))
      .then(git.commit(`Initial commit.`))
      .then(git.addRemote(`origin`, url))
      .then(git.push(`origin`, `master`));
  } finally {
    status.stop();
  }
};

module.exports = {
  login,
  addInitFiles,
  createRemoteRepo,
  initAndPush,
};
