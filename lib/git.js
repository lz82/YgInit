const ConfigStore = require('configstore');

const pkg         = require('../package.json');

const CLI         = require('clui');

const Spinner     = CLI.Spinner;

const axios       = require('axios');

const conf        = new ConfigStore(pkg.name);

// const baseUrl     = `http://${conf.get('yginit-giturl')}/api/v3`;

module.exports = {
  // 根据用户名，到指定gitlab地址获取private_token
  registerNewToken (userInfo, url) {
    return new Promise((resolve, reject) => {
      const status = new Spinner('Authenticating you, please wait...');
      status.start();
      const baseUrl = `http://${url}/api/v3`;
      axios.post(`${baseUrl}/session?login=${userInfo.username}&password=${userInfo.password}`)
      .then(res => {
        const token = res.data.private_token;
        if (token) {
          // 存入configstore
          conf.set(pkg.name, token);
          resolve(token);
          status.stop();
        } else {
          reject('获取token失败');
          status.stop();
        }
      })
      .catch(err => {
        console.log(err);
        reject(err.toString());
        status.stop();
      })
    });
  },

  // 从configstore中获取token
  getStoredToken () {
    return conf.get(pkg.name);
  },

  // 将gitlab地址存入configstore
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

  // 从configstore获取gitlab url
  getStoredGitUrl () {
    return conf.get('yginit-giturl');
  },

  // 获取群组信息
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
