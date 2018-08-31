const inquirer = require('inquirer');

const files    = require('./files.js');

module.exports = {
  askGitlabAddress () {
    const questions = [
      {
        name: 'giturl',
        type: 'input',
        message: 'Enter Your GitLab Url(e.g:git.yg.com)',
        validate (val) {
          if (val.length) {
            return true;
          } else {
            return 'Please Enter Your GitLab Url';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  // 授权交互
  askGitCredentials () {
    const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter Your GitLab UserName:',
      validate (val) {
        if (val.length) {
          return true;
        } else {
          return 'Please Enter Your UserName.';
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter Your Password:',
      validate (val) {
        if (val.length) {
          return true;
        } else {
          return 'Please Enter Your Password.';
        }
      }
    }
    ];
    return inquirer.prompt(questions);
  },

  // 仓库信息交互
  askRepoDetails (groupList) {
    const argv = require('minimist')(process.argv.slice(2), {
      string: ['name', 'desc'],
      alias: {
        name: 'n',
        desc: 'd'
      }
    });

    const questions = [
      {
        name: 'group',
        type: 'list',
        message: 'Choise Group:',
        pageSize: 20,
        choices: groupList.map(item => {
          return {
            name: item.path + '(' + item.description + ')',
            value: item.id
          }
        }),
        validate (val) {
          if (val) {
            return true;
          } else {
            return 'Please Choice a Group';
          }
        }
      },
      {
        type: 'input',
        name: 'reponame',
        message: 'Enter a name for the repository:',
        default: argv.name || files.getCurrentDirectoryBase(),
        validate (val) {
          if (val) {
            return true;
          } else {
            return 'Please Enter Repo Name';
          }
        }
      },

      {
        type: 'input',
        name: 'repodesc',
        message: 'Optionally  enter desc for the repository:',
        default: argv.desc || null
      },

      {
        type: 'list',
        name: 'repotype',
        message: 'Public or private',
        choices: ['public', 'private'],
        default: 'private'
      }
    ];
    return inquirer.prompt(questions);
  },

  // ignore文件交互
  askIgnoreFiles (fileList) {
    const questions = [
      {
        type: 'checkbox',
        name: 'ignore',
        message: 'Select the files and/or folders you wish to ignore:',
        choices: fileList,
        default: ['packages', '.vs', 'node_modules']
      }
    ];
    return inquirer.prompt(questions);
  }
};
