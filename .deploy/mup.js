module.exports = {
  servers: {
    one: {
      host: '206.189.225.62',
      username: 'root',
      pem: '~/.ssh/id_rsa'
    }
  },

  app: {
    name: 'arbol',
    path: '../',
    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      ROOT_URL: 'https://www.arbol.app',
    },

    docker: {
      image: 'abernix/meteord:node-8.4.0-base',
    },

    enableUploadProgressBar: true
  },

  proxy: {
    domains: 'www.arbol.app',
    ssl: {
      letsEncryptEmail: 'bandre@arbolmarket.com'
    }
  }
};
