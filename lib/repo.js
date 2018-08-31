const fs          = require('fs');

const CLI         = require('clui');

const Spinner     = CLI.Spinner;

const axios       = require('axios');

const ConfigStore = require('configstore');

const git         = require('simple-git')();

const touch       = require('touch');

const inquirer    = require('./inquirer.js');

const gitlab      = require('./git.js');

const pkg         = require('../package.json');

const files       = require('./files.js');

const conf        = new ConfigStore(pkg.name);

// const baseUrl     = `http://${conf.get('yginit-giturl')}/api/v3`;

module.exports = {
  // create remote repo
  createRemoteRepo (url) {
    return new Promise(async (resolve, reject) => {
      const baseUrl = `http://${url}/api/v3`;
      const groupList = await gitlab.getGroup(baseUrl);
      const answers   = await inquirer.askRepoDetails(groupList);

      const postData = {
        name: answers.reponame,
        path: answers.reponame,
        namespace_id: answers.group,
        description: answers.repodesc,
        public: answers.repotype === 'public'
      }

      const status = new Spinner('Creating remote repository...');
      status.start();
      axios.post(`${baseUrl}/projects/?private_token=${conf.get(pkg.name)}`, postData)
      .then(res => {
        status.stop();
        console.log(`repo created...url:${res.data.web_url}`);
        resolve(res.data.http_url_to_repo);
      })
      .catch(err => {
        console.log(err.toString());
        status.stop();
        reject();
      });
    });
  },

  // 创建.gitignore文件
  async createGitIgnore () {
    const filelist = files.getCurrentDirectoryFileList();

    if (filelist.length) {
      const ignoreList = await inquirer.askIgnoreFiles(filelist);
      console.log(ignoreList)
      if (ignoreList.ignore.length) {
        fs.writeFileSync('.gitignore', ignoreList.ignore.join('\n'));
      } else {
        // fs.writeFileSync('.gitignore', '');
        touch('.gitignore');
      }
    } else {
      // fs.writeFileSync('.gitignore', '');
      touch('.gitignore');
    }
  },

  async setupRepo (url) {
    const status = new Spinner('Initializing local repository and pushing to remote...');

    status.start();

    try {
      await git
            .init()
            .add('.gitignore')
            .add('./*')
            .commit('Initial commit')
            .addRemote('origin', url)
            .push('origin', 'master');
      return true;
    } catch (err) {
      console.log(err.toString());
      status.stop();
      return false;
    } finally {
      status.stop();
    }
  }
}
