module.exports = {

    id: "wac",
    version: "2.0",
    name: "WAC",

    persistencePrefix: "wac2-",

    ui: require('ripple/platform/wac/2.0/spec/ui'),

    objects: {
        navigator: {
            path: "w3c/1.0/navigator"
        },
    }

};
