module.exports = {
  servers: {
    one: {
      host: '159.65.189.55',
      username: 'root',
      pem: '~/.ssh/id_rsa'
    }
  },

  app: {
    name: 'arbolmarketrinkeby',
    path: '../',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      ROOT_URL: 'https://rinkeby.arbol.market',
      MONGO_URL: 'mongodb://mongodb/meteor',
      MONGO_OPLOG_URL: 'mongodb://mongodb/local',
    },

    docker: {
      image: 'abernix/meteord:node-8.4.0-base',
    },

    enableUploadProgressBar: true
  },

  mongo: {
    version: '3.4.1',
    servers: {
      one: {}
    }
  },

  proxy: {
    domains: 'rinkeby.arbol.market,www.rinkeby.arbol.market',
    ssl: {
      letsEncryptEmail: 'admin@arbolcoin.com'
    }
  }
};
