// const standard = require('@neutrinojs/standardjs');
const react = require('@neutrinojs/react');
const copy = require('@neutrinojs/copy');
const webext = require('neutrino-webextension');
const typescript = require('neutrino-typescript');

module.exports = {
    options: {
        mains: {
            background: {
                entry: 'background',
                webext: {
                    type: 'background'
                }
            },
            popup: {
                entry: 'popup',
                webext: {
                    type: 'browser_action'
                }
            },
            options: {
                entry: 'options',
                webext: {
                    type: 'options_ui'
                }
            }
        }
    },
    use: [
        // standard(),
        typescript(),
        react({
            html: {
                title: 'GitLab Notify'
            }
        }),
        copy({
            patterns: [{ context: 'assets', from: '**/*', to: 'assets', toType: 'dir' }]
        }),
        webext({
            polyfill: true,
            manifest: 'src/manifest',
            minify: {
                // Javascript minification occurs only in production by default.
                // To change uglify-es options or switch to another minifier, see below.
                source: process.env.NODE_ENV === 'production'
            }
        })
    ]
};
