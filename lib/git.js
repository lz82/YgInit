const ConfigStore = require('configstore');

const pkg         = require('../package.json');

const CLI         = require('clui');

const Spinner     = CLI.Spinner;

const axios       = require('axios');

const conf        = new ConfigStore(pkg.name);

// const baseUrl     = `http://${conf.get('yginit-giturl')}/api/v3`;

module.exports = {
  registerNewToken (userInfo, url) {
    return new Promise((resolve, reject) => {
      const status = new Spinner('Authenticating you, please wait...');
      console.log('register...');
      status.start();
      const baseUrl = `http://${url}/api/v3`;
      axios.post(`${baseUrl}/session?login=${userInfo.username}&password=${userInfo.password}`)
      .then(res => {
        const token = res.data.private_token;
        if (token) {
          conf.set(pkg.name, token);
          resolve(token);
          setTimeout(() => {
            status.stop();
          }, 2000);
        } else {
          reject('获取token失败');
          setTimeout(() => {
            status.stop();
          }, 2000);
        }
      })
      .catch(err => {
        console.log(err);
        reject(err.toString());
        setTimeout(() => {
          status.stop();
        }, 2000);
      })
    });
  },

  getStoredToken () {
    return conf.get(pkg.name);
  },

  registerNewGitUrl (url) {
    return new Promise((resolve, reject) => {
      try {
        conf.set('yginit-giturl', url);
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });
  },

  getStoredGitUrl () {
    return conf.get('yginit-giturl');
  },

  getGroup (url) {
    return new Promise((resolve, reject) => {
      const status = new Spinner('Getting GitLab Info, please wait...');
      status.start();
      axios.get(`${url}/groups?private_token=${conf.get(pkg.name)}`)
      .then(res => {
        resolve(res.data);
        status.stop();
      })
      .catch(err => {
        reject(err.toString());
        status.stop();
      })
    });
  }
};
