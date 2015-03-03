/**
 * Created by ed on 02.03.15.
 */
/**
 * Created by ed on 06.12.14.
 */
define('config', [], function () {

    var d = new Date();

    return {

        urlArgs: "v=0.0.5-" + d.getHours() + '-' + d.getMinutes() + '-' + d.getMilliseconds(),

        "paths": {
            "jquery": "libs/jquery",
            "underscore": "libs/underscore",
            "backbone": "libs/backbone",
            "text": "libs/text.min",
            "app": "app/",
            "libs":"libs"
        },

        "shim": {
            "underscore": {
                "deps": ['jquery'],
                "exports": '_'
            },
            "backbone": {
                "deps": ["jquery", "underscore"],
                "exports": "Backbone"
            }
        },

        "waitSeconds": 200
    };
});