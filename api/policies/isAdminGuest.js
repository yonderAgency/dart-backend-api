module.exports = async function(req, res, proceed) {
    sails.hooks.i18n.setLocale(Api.getLocalization(req.headers));
    return proceed();
};
