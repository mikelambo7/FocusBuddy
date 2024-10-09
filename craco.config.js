module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // New rule for Web Workers
        webpackConfig.module.rules.push({
          test: /\.worker\.js$/,
          use: {
            loader: 'worker-loader',
            options: {
              filename: 'static/js/[name].[contenthash:8].js',
            },
          },
        });
  
        return webpackConfig;
      },
    },
  };
  