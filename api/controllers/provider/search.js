const ObjectId = require('mongodb').ObjectID;
const db = ProviderService.getDatastore().manager;
const addressdb = UserAddress.getDatastore().manager;
const userDb = User.getDatastore().manager;

const getCityBasedIds = async (city, approvedProviderIds) => {
    return new Promise(function(resolve, reject) {
        UserAddress.find({
            where: {
                city: city,
                created_by: approvedProviderIds,
                status: sails.config.constants.STATUS_ACTIVE,
                is_deleted: sails.config.constants.IS_ACTIVE
            },
            select: ['created_by']
        }).then(function(users) {
            if (!users || users.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(users, 'created_by'));
        });
    });
};

const getServiceBasedIds = async (serviceId, approvedProviderIds) => {
    return new Promise(function(resolve, reject) {
        ProviderService.find({
            where: {
                service_id: serviceId,
                created_by: approvedProviderIds,
                status: sails.config.constants.STATUS_ACTIVE,
                is_deleted: sails.config.constants.IS_ACTIVE
            }
        }).then(async function(providerService) {
            if (!providerService || providerService.length == 0) {
                return resolve([]);
            }
            let ids = _.map(providerService, 'service_id');
            let services = await Service.find({
                where: {
                    id: {
                        in: ids
                    },
                    status: sails.config.constants.STATUS_ACTIVE,
                    deleted_at: null
                }
            });
            if (!services || services.length == 0) {
                return resolve([]);
            }
            let finalProviders = [];
            let selectedservices = _.map(services, 'id');
            for (x in providerService) {
                if (selectedservices.indexOf(providerService[x].category)) {
                    finalProviders.push(providerService[x].created_by);
                }
            }
            return resolve(finalProviders);
        });
    });
};

const getCategoryBasedIds = async (category, approvedProviderIds) => {
    return new Promise(function(resolve, reject) {
        ProviderService.find({
            where: {
                category_id: category,
                status: sails.config.constants.STATUS_ACTIVE,
                is_deleted: sails.config.constants.IS_ACTIVE,
                created_by: approvedProviderIds
            },
            select: ['created_by', 'category_id']
        }).then(async function(providerService) {
            if (!providerService || providerService.length == 0) {
                return resolve([]);
            }
            let ids = _.map(providerService, 'category_id');
            let categories = await Category.find({
                where: {
                    id: {
                        in: ids
                    },
                    status: sails.config.constants.STATUS_ACTIVE,
                    is_deleted: sails.config.constants.IS_ACTIVE
                }
            });
            if (!categories || categories.length == 0) {
                return resolve([]);
            }
            let finalProviders = [];
            let selectedcategories = _.map(categories, 'id');
            for (x in providerService) {
                if (selectedcategories.indexOf(providerService[x].category)) {
                    finalProviders.push(providerService[x].created_by);
                }
            }
            return resolve(finalProviders);
        });
    });
};

const getFeaturedBasedIds = async approvedProviderIds => {
    return new Promise(function(resolve, reject) {
        ProviderProfile.find({
            where: {
                is_featured: sails.config.constants.IS_FEATURED,
                created_by: approvedProviderIds
            },
            select: ['created_by']
        }).then(function(providers) {
            if (!providers || providers.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(providers, 'created_by'));
        });
    });
};

const getPriceAscBasedIds = async approvedProviderIds => {
    var providers = await db
        .collection('providerservice')
        .aggregate([
            {
                $match: {
                    created_by: {
                        $in: approvedProviderIds
                    },
                    status: sails.config.constants.STATUS_ACTIVE,
                    is_deleted: sails.config.constants.IS_ACTIVE
                }
            },
            {
                $sort: {
                    price: 1
                }
            },
            {
                $group: {
                    _id: '$created_by',

                    price: {
                        $first: '$price'
                    }
                }
            },
            {
                $sort: {
                    price: 1
                }
            }
        ])
        .toArray();
    if (providers && providers.length > 0) {
        return _.map(providers, function(x) {
            return x.created_by.toString();
        });
    } else {
        return [];
    }
};
const getPriceDescBasedIds = async approvedProviderIds => {
    var providers = await db
        .collection('providerservice')
        .aggregate([
            {
                $match: {
                    created_by: {
                        $in: approvedProviderIds
                    },
                    status: sails.config.constants.STATUS_ACTIVE,
                    is_deleted: sails.config.constants.IS_ACTIVE
                }
            },
            {
                $sort: {
                    price: -1
                }
            },
            {
                $group: {
                    _id: '$created_by',

                    price: {
                        $first: '$price'
                    }
                }
            },
            {
                $sort: {
                    price: -1
                }
            }
        ])
        .toArray();
    if (providers && providers.length > 0) {
        return _.map(providers, '_id');
    } else {
        return [];
    }
};

const getNameAscBasedIds = async approvedProviderIds => {
    return new Promise(function(resolve, reject) {
        ProviderProfile.find({
            where: {
                created_by: approvedProviderIds
            },
            sort: 'business_name ASC',
            select: ['created_by']
        }).then(function(providers) {
            if (!providers || providers.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(providers, 'created_by'));
        });
    });
};

const getNameDescBasedIds = async approvedProviderIds => {
    return new Promise(function(resolve, reject) {
        ProviderProfile.find({
            where: {
                created_by: approvedProviderIds
            },
            sort: 'business_name DESC',
            select: ['created_by']
        }).then(function(providers) {
            if (!providers || providers.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(providers, 'created_by'));
        });
    });
};

const getRatingBasedIds = async approvedProviderIds => {
    return new Promise(function(resolve, reject) {
        RatingLog.find({
            where: {
                created_by: approvedProviderIds,
                status: sails.config.constants.STATUS_ACTIVE
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

module.exports = async function search(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userId = null;
    if (req.headers['x-auth-token']) {
        userId = await Api.getLoggedInUserId(req.headers);
    }
    const city = req.param('city');
    const category = req.param('category');
    const service = req.param('service');
    const type = req.param('type');
    const featured = req.param('featured');
    const pincode = req.param('pincode');

    let limit = req.param('limit');
    if (typeof limit == 'undefined') {
        limit = 10;
    }
    let page = req.param('page');
    if (typeof page == 'undefined') {
        page = 1;
    }

    try {
        let list = [];
        let approvedProviderIds = [];
        let providers = [];

        providers = await User.find({
            where: {
                status: sails.config.constants.STATUS_ACTIVE,
                role: sails.config.constants.ROLE_PROVIDER,
                completed: sails.config.constants.PROFILE_COMPLETED,
                deleted_at: null,
                is_blocked: sails.config.constants.IS_UNBLOCKED,
                under_review: sails.config.constants.NOT_UNDER_REVIEW
            },
            select: ['id']
        });
        if (providers && providers.length > 0) {
            approvedProviderIds = _.map(providers, 'id');
        }

        if (
            typeof type != 'undefined' &&
            type == sails.config.constants.PROVIDER_FILTER_DISTANCE
        ) {
            approvedProviderIds = await getNearestDistanceBasedIds(
                approvedProviderIds,
                pincode,
                req.location.latitude,
                req.location.longitude,
                sails.config.dynamics.SEARCH_RADIUS
            );
        } else {
            approvedProviderIds = await getNearestDistanceBasedIds(
                approvedProviderIds,
                pincode,
                req.location.latitude,
                req.location.longitude,
                sails.config.dynamics.SEARCH_RADIUS * 2
            );
        }

        if (featured) {
            approvedProviderIds = await getFeaturedBasedIds(
                approvedProviderIds
            );
        }

        if (city && city != null && city != '') {
            approvedProviderIds = await getCityBasedIds(
                city,
                approvedProviderIds
            );
        }

        if (category && category != null && category != '') {
            approvedProviderIds = await getCategoryBasedIds(
                category,
                approvedProviderIds
            );
        }

        if (service && service != null && service != '') {
            approvedProviderIds = await getServiceBasedIds(
                service,
                approvedProviderIds
            );
        }

        if (
            typeof type != 'undefined' &&
            type == sails.config.constants.PROVIDER_FILTER_PRICE_ACCENDING
        ) {
            approvedProviderIds = await getPriceAscBasedIds(
                approvedProviderIds
            );
        }
        if (
            typeof type != 'undefined' &&
            type == sails.config.constants.PROVIDER_FILTER_PRICE_DESENDING
        ) {
            approvedProviderIds = await getPriceDescBasedIds(
                approvedProviderIds
            );
        }
        if (
            typeof type != 'undefined' &&
            type == sails.config.constants.PROVIDER_FILTER_NAME_A
        ) {
            approvedProviderIds = await getNameAscBasedIds(approvedProviderIds);
        }

        if (
            typeof type != 'undefined' &&
            type == sails.config.constants.PROVIDER_FILTER_NAME_Z
        ) {
            approvedProviderIds = await getNameDescBasedIds(
                approvedProviderIds
            );
        }
        if (
            typeof type != 'undefined' &&
            type == sails.config.constants.PROVIDER_FILTER_RATING
        ) {
            approvedProviderIds = await getRatingBasedIds(approvedProviderIds);
        }

        let approvedProviderIdsOb = approvedProviderIds.map(
            item => new ObjectId(item)
        );

        let users = await userDb
            .collection('user')
            .aggregate([
                {
                    $match: {
                        _id: {
                            $in: approvedProviderIdsOb
                        },
                        role: sails.config.constants.ROLE_PROVIDER
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
            for (const x in updatedusers) {
                let check = await Api.checkForBusinessHours(
                    updatedusers[x].id,
                    req.param('day'),
                    req.param('offset')
                );
                if (check) {
                    list.push(await User.getJson(updatedusers[x], userId));
                }
            }
            response.totalPages = Math.ceil(updatedusers.length / limit);
            response.next = response.totalPages - page > 0 ? true : false;
            response.previous = page > 1 ? true : false;
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = list;
        } else {
            response.message = sails.__('No provider found');
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
