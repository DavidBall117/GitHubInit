const inquirer = require(`inquirer`);

const askUserCredentials = async (service) => {
  const questions = [
    {
      name: `username`,
      type: `input`,
      message: `Enter your ${service} username or e-mail address:`,
      validate: (value) => {
        if (value.length) {
          return true;
        } else {
          return `Please enter your ${service} username or e-mail address.`;
        }
      },
    },

    {
      name: `password`,
      type: `password`,
      message: `Enter your ${service} password:`,
      validate: (value) => {
        if (value.length) {
          return true;
        } else {
          return `Please enter your ${service} password.`;
        }
      },
    },
  ];

  return await inquirer.prompt(questions);
};

const askRepoDetails = async () => {
  const questions = [
    {
      type: `input`,
      name: `name`,
      message: `Enter a name for the repository:`,
      validate: (value) => {
        if (value.length) {
          return true;
        } else {
          return `Please enter a name for the repository.`;
        }
      },
    },

    {
      type: `input`,
      name: `description`,
      message: `Optionally enter a description of the repository:`,
    },

    {
      type: `list`,
      name: `visibility`,
      message: `Public or private:`,
      choices: [`public`, `private`],
      default: `private`,
    },
  ];

  return await inquirer.prompt(questions);
};

const askIgnoreFiles = async (fileList) => {
  const questions = [
    {
      type: `checkbox`,
      name: `ignore`,
      message: `Select the files and/or folders you wish to ignore:`,
      choices: fileList,
      default: [`node_modules`, `.env`],
    },
  ];

  return await inquirer.prompt(questions);
};

module.exports = {
  askUserCredentials,
  askRepoDetails,
  askIgnoreFiles,
};
