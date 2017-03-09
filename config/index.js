// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: require('./dev.env'),
    port: 8090,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {

        // '/apis/risk': {
        //     target: 'https://test-m.spa.com',//'http://172.16.10.175:8090', //,
        //     changeOrigin:true,
        //     pathRewrite:{
        //         '^/apis':'/apis/risk'
        //     }
        // }, 
        '/apis/h5': {
            target: 'https://test-passport.spa.com',
            changeOrigin:true,// 本地虚拟一个服务器代发你的请求
            pathRewrite:{
                '^/apis/h5':'/apis/h5'
            }
        },
        '/apis': {
            target: 'https://test-m.spa.com',
            changeOrigin:true,// 本地虚拟一个服务器代发你的请求
            pathRewrite:{
                '^/apis':'/apis'
            }
        },
        
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
