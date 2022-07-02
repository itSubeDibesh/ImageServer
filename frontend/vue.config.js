const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: '../public',
  configureWebpack: {
    devServer: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080'
        },
        "/uploads": {
          target: "http://localhost:8080",
        }
      }
    }
  },
  publicPath: process.env.WORK_ENV === 'production'? '/frontend/' : '/',
  pwa: {
    name: 'Image Server',
    shortName: 'Image',
    themeColor: '#4DBA87',
    icons: {
      favicon32: '/img/icons/favicon-32x32.png',
      favicon16: '/img/icons/favicon-16x16.png',
      appleTouchIcon: '/img/icons/apple-touch-icon-152x152.png',
      maskIcon: '/img/icons/safari-pinned-tab.svg',
      msTileImage: '/img/icons/msapplication-icon-144x144.png'
    }
  }
})
