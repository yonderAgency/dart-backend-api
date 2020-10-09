const ObjectId = require('mongodb').ObjectID;
const db = ProviderService.getDatastore().manager;
const addressdb = UserAddress.getDatastore().manager;
const userDb = User.getDatastore().manager;

const getFeaturedBasedIds = async (approvedProviderIds) => {
    return new Promise(function (resolve, reject) {
        ProviderProfile.find({
            where: {
                is_featured: sails.config.constants.IS_FEATURED,
                created_by: approvedProviderIds,
            },
            select: ['created_by'],
        }).then(function (providers) {
            if (!providers || providers.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(providers, 'created_by'));
        });
    });
};

const getPriceAscBasedIds = async (approvedProviderIds) => {
    var providers = await db
        .collection('providerservice')
        .aggregate([
            {
                $match: {
                    created_by: {
                        $in: approvedProviderIds,
                    },
                    status: sails.config.constants.STATUS_ACTIVE,
                    is_deleted: sails.config.constants.IS_ACTIVE,
                },
            },
            {
                $sort: {
                    price: 1,
                },
            },
            {
                $group: {
                    _id: '$created_by',
                    price: {
                        $first: '$price',
                    },
                },
            },
            {
                $sort: {
                    price: 1,
                },
            },
        ])
        .toArray();
    if (providers && providers.length > 0) {
        return _.map(providers, '_id');
    } else {
        return [];
    }
};

const getPriceDescBasedIds = async (approvedProviderIds) => {
    var providers = await db
        .collection('providerservice')
        .aggregate([
            {
                $match: {
                    created_by: {
                        $in: approvedProviderIds,
                    },
                    status: sails.config.constants.STATUS_ACTIVE,
                    is_deleted: sails.config.constants.IS_ACTIVE,
                },
            },
            {
                $sort: {
                    price: -1,
                },
            },
            {
                $group: {
                    _id: '$created_by',
                    price: {
                        $first: '$price',
                    },
                },
            },
            {
                $sort: {
                    price: -1,
                },
            },
        ])
        .toArray();
    if (providers && providers.length > 0) {
        return _.map(providers, '_id');
    } else {
        return [];
    }
};

const getNameAscBasedIds = async (approvedProviderIds) => {
    return new Promise(function (resolve, reject) {
        ProviderProfile.find({
            where: {
                created_by: approvedProviderIds,
            },
            sort: 'business_name ASC',
            select: ['created_by'],
        }).then(function (providers) {
            if (!providers || providers.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(providers, 'created_by'));
        });
    });
};

const getNameDescBasedIds = async (approvedProviderIds) => {
    return new Promise(function (resolve, reject) {
        ProviderProfile.find({
            where: {
                created_by: approvedProviderIds,
            },
            sort: 'business_name DESC',
            select: ['created_by'],
        }).then(function (providers) {
            if (!providers || providers.length == 0) {
                return resolve([]);
            }
            return resolve(_.map(providers, 'created_by'));
        });
    });
};

const getRatingBasedIds = async (approvedProviderIds) => {
    return new Promise(function (resolve, reject) {
        RatingLog.find({
            where: {
                created_by: approvedProviderIds,
            },
            sort: 'ar DESC',
            select: ['created_by'],
        }).then(function (providers) {
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
        (item) => new ObjectId(item)
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
                                parseFloat(latitude),
                            ],
                        },
                        maxDistance: search_radius,
                        distanceField: 'dist.calculated',
                        includeLocs: 'dist.location',
                        spherical: true,
                    },
                },
                {
                    $match: {
                        created_by: {
                            $in: approvedProviderIdsOb,
                        },
                        is_deleted: sails.config.constants.IS_ACTIVE,
                        status: sails.config.constants.STATUS_ACTIVE,
                    },
                },
            ])
            .toArray();
    } else {
        providers = await addressdb
            .collection('useraddress')
            .aggregate([
                {
                    $match: {
                        created_by: {
                            $in: approvedProviderIdsOb,
                        },
                        zipcode: pincode,
                        status: sails.config.constants.STATUS_ACTIVE,
                        is_deleted: sails.config.constants.IS_ACTIVE,
                    },
                },
                {
                    $group: {
                        _id: '$created_by',
                    },
                },
            ])
            .toArray();
    }

    if (providers && providers.length > 0) {
        return _.map(providers, function (x) {
            return x.created_by.toString();
        });
    } else {
        return [];
    }
};

module.exports = async function searchMain(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    if (req.headers['x-auth-token']) {
        userId = await Api.getLoggedInUserId(req.headers);
    }
    let city = req.param('city');
    let service = req.param('service');
    let serviceName = req.param('serviceName');
    const category = req.param('category');
    const type = req.param('type');
    const featured = req.param('featured');
    const pincode = req.param('pincode');

    let limit = req.param('limit');
    if (typeof limit == 'undefined') {
        limit = 5;
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
                is_deleted: 2,
                is_blocked: sails.config.constants.IS_UNBLOCKED,
                under_review: sails.config.constants.NOT_UNDER_REVIEW,
            },
            select: ['id'],
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

        // if (city != 'none' && city.trim() && city.trim().length > 0) {
        //     city = city.charAt(0).toUpperCase() + city.slice(1);
        //     let cityBased = await UserAddress.find({
        //         where: {
        //             city: city,
        //             created_by: {
        //                 in: approvedProviderIds,
        //             },
        //         },
        //         sort: 'city ASC',
        //         select: ['created_by'],
        //     });

        //     if (cityBased.length >= 0) {
        //         approvedProviderIds = _.map(cityBased, 'created_by');
        //     } else {
        //         approvedProviderIds = [];
        //     }
        // }
        // console.log({ city, approvedProviderIds });
        if (category && category != 'all' && category != 'none') {
            if (
                category.length > 0 &&
                category !== 'all' &&
                category.trim() &&
                category.trim().length > 0
            ) {
                let categoryBased = await ProviderService.find({
                    where: {
                        category_id: category.trim(),
                        status: sails.config.constants.STATUS_ACTIVE,
                        is_deleted: sails.config.constants.IS_ACTIVE,
                        created_by: {
                            in: approvedProviderIds,
                        },
                    },
                    sort: 'created_at ASC',
                    select: ['created_by'],
                });
                if (categoryBased.length >= 0) {
                    approvedProviderIds = _.map(categoryBased, 'created_by');
                } else {
                    approvedProviderIds = [];
                }
            }
        }

        if (
            service &&
            service.trim() &&
            service.trim().length > 0 &&
            service != 'none'
        ) {
            let serviceIds = [];
            let serviceBased = await Service.find({
                where: {
                    slug: service,
                    deleted_at: null,
                    status: sails.config.constants.STATUS_ACTIVE,
                },
                sort: 'name ASC',
                select: ['id'],
            });
            if (serviceBased.length > 0) {
                for (x in serviceBased) {
                    serviceIds.push(serviceBased[x].id);
                }
                if (serviceIds && serviceIds.length > 0) {
                    let serviceBasedProviders = await ProviderService.find({
                        where: {
                            service_id: { in: serviceIds },
                            status: sails.config.constants.STATUS_ACTIVE,
                            is_deleted: sails.config.constants.IS_ACTIVE,
                        },
                        sort: 'created_at ASC',
                        select: ['created_by'],
                    });
                    approvedProviderIds = _.map(
                        serviceBasedProviders,
                        'created_by'
                    );
                } else {
                    approvedProviderIds = [];
                }
            } else {
                approvedProviderIds = [];
            }
        }
        if (
            serviceName &&
            serviceName.trim() &&
            serviceName.trim().length > 0 &&
            serviceName != 'none'
        ) {
            serviceName = serviceName.charAt(0).toUpperCase();
            let serviceNameBased = await Service.find({
                where: {
                    name: {
                        contains: serviceName.trim(),
                    },
                    deleted_at: null,
                    status: sails.config.constants.STATUS_ACTIVE,
                },
                sort: 'name ASC',
                select: ['created_by'],
            });
            if (serviceNameBased.length > 0) {
                let serviceNameBasedIds = [];
                for (x in serviceNameBased) {
                    serviceNameBasedIds.push(serviceNameBased[x].id);
                }
                let serviceNameBasedUsers = await ProviderService.find({
                    where: {
                        created_by: {
                            in: approvedProviderIds,
                        },
                        service_id: { in: serviceNameBasedIds },
                        status: sails.config.constants.STATUS_ACTIVE,
                        is_deleted: sails.config.constants.IS_ACTIVE,
                    },
                    sort: 'created_at ASC',
                    select: ['created_by'],
                });
                approvedProviderIds = _.map(
                    serviceNameBasedUsers,
                    'created_by'
                );
            } else {
                approvedProviderIds = [];
            }
        }

        if (featured === true) {
            approvedProviderIds = await getFeaturedBasedIds(
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
            (item) => new ObjectId(item)
        );
        let users = await userDb
            .collection('user')
            .aggregate([
                {
                    $match: {
                        _id: {
                            $in: approvedProviderIdsOb,
                        },
                        role: sails.config.constants.ROLE_PROVIDER,
                    },
                },
                {
                    $addFields: {
                        sortField: {
                            $indexOfArray: [approvedProviderIdsOb, '$_id'],
                        },
                    },
                },
                {
                    $sort: { sortField: 1 },
                },
                {
                    $skip: limit * (page - 1),
                },
                {
                    $limit: limit,
                },
            ])
            .toArray();

        let totalUsers = await userDb
            .collection('user')
            .aggregate([
                {
                    $match: {
                        _id: {
                            $in: approvedProviderIdsOb,
                        },
                        role: sails.config.constants.ROLE_PROVIDER,
                    },
                },
                {
                    $addFields: {
                        sortField: {
                            $indexOfArray: [approvedProviderIdsOb, '$_id'],
                        },
                    },
                },
                {
                    $sort: { sortField: 1 },
                },
            ])
            .toArray();

        const totalUserCount = _.map(totalUsers, (item) => {
            if (item.hasOwnProperty('_id')) {
                item['id'] = item._id.toString();
            }
            return item;
        });

        let updatedusers = [];
        if (users.length > 0) {
            updatedusers = _.map(users, (item) => {
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

            response.totalPages = Math.ceil(totalUserCount.length / limit);
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
        console.log({ err });
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
