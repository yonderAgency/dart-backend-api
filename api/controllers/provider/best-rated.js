const ObjectId = require('mongodb').ObjectID;
const addressdb = UserAddress.getDatastore().manager;

const getRatingBasedIds = async approvedProviderIds => {
    return new Promise(function(resolve, reject) {
        RatingLog.find({
            where: {
                created_by: approvedProviderIds
            },
            sort: 'ar DESC',
            select: ['created_by']
        }).then(function(providers) {
            if (!providers || providers.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(providers, 'created_by'));
        });
    });
};

const getNearestDistanceBasedIds = async (
    approvedProviderIds,
    pincode,
    latitude,
    longitude,
    search_radius = 10
) => {
    let approvedProviderIdsOb = approvedProviderIds.map(
        item => new ObjectId(item)
    );
    let providers = [];
    if (latitude && longitude) {
        providers = await addressdb
            .collection('useraddress')
            .aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [
                                parseFloat(longitude),
                                parseFloat(latitude)
                            ]
                        },
                        maxDistance: search_radius,
                        distanceField: 'dist.calculated',
                        includeLocs: 'dist.location',
                        spherical: true
                    }
                },
                {
                    $match: {
                        created_by: {
                            $in: approvedProviderIdsOb
                        },
                        is_deleted: sails.config.constants.IS_ACTIVE,
                        status: sails.config.constants.STATUS_ACTIVE
                    }
                }
            ])
            .toArray();
    } else {
        providers = await addressdb
            .collection('useraddress')
            .aggregate([
                {
                    $match: {
                        created_by: {
                            $in: approvedProviderIdsOb
                        },
                        zipcode: pincode,
                        status: sails.config.constants.STATUS_ACTIVE,
                        is_deleted: sails.config.constants.IS_ACTIVE
                    }
                },
                {
                    $group: {
                        _id: '$created_by'
                    }
                }
            ])
            .toArray();
    }

    if (providers && providers.length > 0) {
        return _.map(providers, function(x) {
            return x.created_by.toString();
        });
    } else {
        return [];
    }
};

module.exports = async function bestRated(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    if (req.headers['x-auth-token']) {
        userId = await Api.getLoggedInUserId(req.headers);
    }
    let limit = req.param('limit');
    if (typeof limit == 'undefined') {
        limit = 10;
    }
    let page = req.param('page');
    if (typeof page == 'undefined') {
        page = 1;
    }
    let pincode = req.param('pincode');
    try {
        let list = [];
        let approvedProviderIds = [];
        let providers = [];

        providers = await User.find({
            where: {
                role: sails.config.constants.ROLE_PROVIDER,
                completed: sails.config.constants.PROFILE_COMPLETED,
                is_deleted: sails.config.constants.IS_ACTIVE,
                is_blocked: sails.config.constants.IS_UNBLOCKED,
                under_review: sails.config.constants.NOT_UNDER_REVIEW
            },
            select: ['id']
        });
        if (providers && providers.length > 0) {
            approvedProviderIds = _.map(providers, 'id');
        }
        approvedProviderIds = await getRatingBasedIds(approvedProviderIds);

        approvedProviderIds = await getNearestDistanceBasedIds(
            approvedProviderIds,
            pincode,
            req.location.latitude,
            req.location.longitude,
            sails.config.dynamics.SEARCH_RADIUS
        );

        let approvedProviderIdsOb = approvedProviderIds.map(
            item => new ObjectId(item)
        );

        const userDb = User.getDatastore().manager;
        let users = await userDb
            .collection('user')
            .aggregate([
                {
                    $match: {
                        _id: {
                            $in: approvedProviderIdsOb
                        }
                    }
                },
                {
                    $addFields: {
                        sortField: {
                            $indexOfArray: [approvedProviderIdsOb, '$_id']
                        }
                    }
                },
                {
                    $sort: { sortField: 1 }
                },
                {
                    $skip: limit * (page - 1)
                },
                {
                    $limit: limit
                }
            ])
            .toArray();

        let updatedusers = [];
        if (users.length > 0) {
            updatedusers = _.map(users, item => {
                if (item.hasOwnProperty('_id')) {
                    item['id'] = item._id.toString();
                }
                return item;
            });
        }

        if (updatedusers.length > 0) {
            for (x in updatedusers) {
                list.push(await User.getJson(updatedusers[x], userId));
            }
            response.totalPages = Math.ceil(updatedusers.length / limit);
            response.next = response.totalPages - page > 0 ? true : false;
            response.previous = page > 1 ? true : false;
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data.providerList = list;
            response.data.page = page;
        } else {
            response.status = 'OK';
            response.message = sails.__('No provider found');
            response.data.providerList = [];
            response.data.page = page;
        }
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
