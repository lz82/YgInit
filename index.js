#!/usr/bin/env node

const chalk    = require('chalk');

const clear    = require('clear');

const figlet   = require('figlet');

const CLI      = require('clui');

const Spinner  = CLI.Spinner;

const files    = require('./lib/files.js');

const inquirer = require('./lib/inquirer.js');

const git      = require('./lib/git.js');

const repo     = require('./lib/repo.js');

// 清除屏幕
clear();

// 打印Banner
console.log(
  chalk.yellow(
    figlet.textSync('Welcome To Use YgInit', {
      // font: 'Ghost',
      horizontalLayout: 'full',
      verticalLayout: 'default'
    })
    )
  );

// 判断是否存在.git
if (files.directoryExists('.git')) {
  console.log(chalk.red('Already a git repository!'));
  process.exit();
} else {
  console.log(chalk.blue('let\'s begin!'));
}

const run = async () => {

  try {
    // 0.0 先获取git地址
    let gitUrl = git.getStoredGitUrl();

    if (!gitUrl) {
      const temp = await inquirer.askGitlabAddress();
      gitUrl = temp.giturl;
      git.registerNewGitUrl(gitUrl);
    }

    // 1.0 先从store中获取token
    let token = git.getStoredToken();

    if (!token) {
      // 1.1如果不存在，则需要输入用户名密码
      const credentials = await inquirer.askGitCredentials();

      const token = await git.registerNewToken(credentials, gitUrl);
    }

    // 2.0 创建远端仓库
    const repoUrl = await repo.createRemoteRepo(gitUrl);

    // 3.0 创建gitignore文件
    await repo.createGitIgnore();
    // 4.0 初始化仓库
    const done = await repo.setupRepo(repoUrl);
    if (done) {
      console.log(chalk.green('All done!'));
    }
  } catch (err) {
    console.log(chalk.red(err));
  }
};

run();
