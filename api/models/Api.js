/**
 * Api.js
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const moment = require('moment');

module.exports = {
    verifyToken: async function (req, res) {
        var token = req.headers['x-auth-token'];
        var response = {
            status: 'AUTH',
            message: sails.__('Not a Valid User'),
        };

        if (typeof token !== 'undefined') {
            var exists = await Token.find({
                token_value: token,
            });
            if (exists.length > 0) {
                var user = await User.find({
                    id: exists.owner,
                });
                if (!user) {
                    return response;
                } else {
                    response.status = 'NOK';
                    response.message = '';
                    response.loggedInUser = user[0].id;
                    return response;
                }
            } else {
                return res.json(response);
            }
        } else {
            return res.json(response);
        }
    },

    fetchTime: function (start) {
        var hours = parseInt(start / 3600);
        var tempHour = start / 3600;
        var tempMinutes = tempHour - hours;
        var meridian = 'am';
        var fullFormat = hours;
        if (hours > 12) {
            hours = hours - 12;
            meridian = 'pm';
        } else if (hours == 12) {
            meridian = 'pm';
            true;
        }
        hours = hours < 10 ? '0' + hours : hours;
        var minutes = Math.floor(tempMinutes * 60);
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return {
            label: hours + meridian,
            hours: fullFormat,
        };
    },

    getStatusForSlots: function (date, isToday, offset, hours) {
        if (isToday) {
            let tempHour = moment(date).utcOffset(-offset).format('HH');
            let tempMinutes = moment(date).utcOffset(-offset).format('mm');
            if (tempMinutes > sails.config.constants.BOOKING_TIMER_THRESHOLD) {
                tempHour = parseInt(tempHour) + 1;
            }
            if (parseInt(tempHour) >= parseInt(hours)) {
                return false;
            }
        }
        return true;
    },

    fetchSlots: async function (date, isToday, offset, start, end) {
        var slots = [];
        for (var x = start; x <= end; x += 3600) {
            var convertedStart = this.fetchTime(x);
            var convertedEnd = this.fetchTime(x + 3600);
            slots.push({
                label: convertedStart.label + ' - ' + convertedEnd.label,
                start: x,
                end: x + 3599,
                status: this.getStatusForSlots(
                    date,
                    isToday,
                    offset,
                    convertedStart.hours
                ),
            });
        }
        return slots;
    },

    getBaseImages: function (single = null) {
        if (single != null) {
            var refArray = ['small.jpg', 'medium.jpg', 'large.jpg'];
            return (
                sails.config.constants.BASE_URL +
                '/images/default/' +
                refArray[single - 1]
            );
        }
        return {
            small:
                sails.config.constants.BASE_URL + '/images/default/small.jpg',
            medium:
                sails.config.constants.BASE_URL + '/images/default/medium.jpg',
            large:
                sails.config.constants.BASE_URL + '/images/default/large.jpg',
        };
    },

    getActualImages: function (path, image, single = null) {
        let baseUrl = sails.config.constants.BASE_URL;
        if (sails.config.dynamics.AWS_ACTIVE) {
            baseUrl = sails.config.constants.BASE_URL;
        }
        if (single != null) {
            var refArray = ['small/', 'medium/', 'large/'];
            return baseUrl + path + refArray[single - 1] + image;
        }
        return {
            small: baseUrl + path + 'small/' + image,
            medium: baseUrl + path + 'medium/' + image,
            large: baseUrl + path + 'large/' + image,
        };
    },

    getWebsiteImage: async function () {
        var imageUrl =
            sails.config.constants.BASE_URL + '/images/' + 'website-logo.png';
        var settings = await Settings.find({
            status: sails.config.constants.STATUS_ACTIVE,
        }).limit(1);
        if (settings && settings.length > 0) {
            if (
                settings[0].WEBSITE_LOGO != null &&
                settings[0].WEBSITE_LOGO != ''
            ) {
                imageUrl = await Api.getActualImages(
                    '/uploads/website/',
                    settings[0].WEBSITE_LOGO,
                    2
                );
            }
        }
        return imageUrl;
    },

    removeToken: async function (user, token) {
        await Token.destroy({
            owner: user,
            token: token,
        });
        return true;
    },

    checkAttribute: function (attribute) {
        if (typeof attribute === 'boolean') {
            if (attribute === false) {
                return false;
            }
        }
        if (attribute && typeof attribute !== 'undefined') {
            return attribute;
        } else {
            if (typeof attribute == 'number' || typeof attribute == 'boolean') {
                return attribute;
            }
            return '';
        }
    },

    checkIncomingAttribute: function (attribute, defaults) {
        if (typeof attribute === 'boolean') {
            if (attribute === false) {
                return false;
            }
        }
        if (
            attribute &&
            typeof attribute !== 'undefined' &&
            attribute !== '' &&
            attribute !== null
        ) {
            return attribute;
        }
        return defaults;
    },

    getLoggedInUserId: async function (headers, model = false) {
        var token = headers['x-auth-token'];
        if (typeof token !== 'undefined') {
            var exists = await Token.find({
                token_value: token,
            }).limit(1);
            if (exists.length > 0) {
                var user = await User.find({
                    id: exists[0].owner,
                }).limit(1);
                if (user && user.length > 0) {
                    if (model == true) {
                        return user[0];
                    }
                    return user[0].id;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    },

    getLocalization: function (headers, user = null) {
        let returnVar = sails.config.constants.LOCALE;
        if (typeof headers['accept-language'] !== 'undefined') {
            if (
                sails.config.i18n.locales.indexOf(headers['accept-language']) !=
                -1
            ) {
                returnVar = headers['accept-language'];
            } else {
                if (user && user != null) {
                    if (
                        sails.config.i18n.locales.indexOf(user.language) != -1
                    ) {
                        returnVar = user.language;
                    }
                }
            }
        } else {
            if (user && user != null) {
                if (sails.config.i18n.locales.indexOf(user.language) != -1) {
                    returnVar = user.language;
                }
            }
        }
        return returnVar;
    },

    checkFakes: function (email) {
        var fakeList = sails.config.dynamics.FAKE_DOMAINS;
        if (fakeList && fakeList.length > 0) {
            for (x in fakeList) {
                if (email.indexOf(fakeList[x])) {
                    return true;
                }
            }
        }
        return false;
    },

    getLocationByIp: async function (ip) {
        const url = 'http://api.ipstack.com/' + ip;
        const data = await axios.get(url, {
            params: {
                access_key: sails.config.dynamics.IP_STACK_KEY,
                language: 'en',
                output: 'json',
            },
        });
        if (
            data &&
            typeof data.data.longitude != 'undefined' &&
            typeof data.data.latitude != 'undefined'
        ) {
            return data.data;
        }
        return null;
    },

    getZipcodeByIp: async function (ip) {
        const url = 'http://api.ipstack.com/' + ip;
        const data = await axios.get(url, {
            params: {
                access_key: sails.config.dynamics.IP_STACK_KEY,
                language: 'en',
                output: 'json',
            },
        });
        if (data && typeof data.data.zip != 'undefined') {
            return data.data.zip;
        }
        return null;
    },

    removeOtherTokens: async function (user, token) {
        await Token.destroy({
            owner: user,
            token_value: {
                '!=': token,
            },
        });
        return true;
    },

    uploadVendorDocs: function (file) {
        return new Promise(function (resolve, reject) {
            file.upload(
                {
                    dirname: path.resolve(
                        sails.config.appPath,
                        'assets/uploads/vendorDocs'
                    ),
                    maxBytes: sails.config.dynamics.MEDIA_SIZE,
                },
                function (err, uploadedFiles) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(uploadedFiles);
                }
            );
        });
    },

    generatedCode: async function (string_length = 6) {
        var chars =
            '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
        var randomstring = '';
        for (var i = 0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    },

    filterIp: function (ipAddress) {
        if (ipAddress.indexOf('::ffff:') > -1) {
            ipAddress = ipAddress.replace(/^::ffff:+/i, '');
        }
        return ipAddress;
    },

    getDeliveryJobStatus: function (status) {
        if (status == sails.config.constants.BOOKING_STATUS_INCART) {
            return 'INCART';
        }
        if (status == sails.config.constants.BOOKING_STATUS_INITIATED) {
            return 'INITIATED';
        }
        if (status == sails.config.constants.BOOKING_STATUS_CANCELLED) {
            return 'CANCELLED';
        }
        if (status == sails.config.constants.BOOKING_STATUS_REJECTED) {
            return 'REJECTED';
        }
        if (status == sails.config.constants.BOOKING_STATUS_CONFIRMED) {
            return 'PROVIDERCONFIRMED';
        }
        if (status == sails.config.constants.BOOKING_STATUS_STARTED) {
            return 'DISPATCHED';
        }
        if (
            status == sails.config.constants.BOOKING_STATUS_ENDED ||
            status == sails.config.constants.BOOKING_STATUS_COMPLETED
        ) {
            return 'COMPLETED';
        }
        return 'INCART';
    },

    fetchProviderSortKeys: function (type = null) {
        returnKey = {
            foreign: 'User',
            string: '',
        };
        if (type == sails.config.constants.PROVIDER_FILTER_PRICE_ACCENDING) {
            returnKey = {
                foreign: 'ProviderService',
                string: 'price ASC',
            };
        } else if (
            type == sails.config.constants.PROVIDER_FILTER_PRICE_DESENDING
        ) {
            returnKey = {
                foreign: 'ProviderService',
                string: 'price DESC',
            };
        } else if (type == sails.config.constants.PROVIDER_FILTER_RATING) {
            returnKey = {
                foreign: 'RatingLog',
                string: 'ar DESC',
            };
        } else if (type == sails.config.constants.PROVIDER_FILTER_NAME_A) {
            returnKey = {
                foreign: 'ProviderProfile',
                string: 'business_name ASC',
            };
        } else if (type == sails.config.constants.PROVIDER_FILTER_NAME_Z) {
            returnKey = {
                foreign: 'ProviderProfile',
                string: 'business_name DESC',
            };
        } else if (type == sails.config.constants.PROVIDER_FILTER_DISTANCE) {
            returnKey = {
                foreign: 'User',
                string: 'distance DESC',
            };
        }
        return returnKey;
    },

    checkDirectories: function (folder) {
        let folders = [
            folder + '/small/',
            folder + '/medium/',
            folder + '/large/',
        ];
        for (x in folders) {
            if (!fs.existsSync(folders[x])) {
                fs.mkdirSync(folders[x]);
            }
        }
    },

    checkDirectoriesOld: function (folder) {
        let folders = [
            sails.config.appPath + '/assets/uploads/temp/',
            sails.config.appPath + '/assets/uploads' + folder + '/large/',
            sails.config.appPath + '/assets/uploads' + folder + '/medium/',
            sails.config.appPath + '/assets/uploads' + folder + '/large/',
        ];
        for (x in folders) {
            if (!fs.existsSync(folders[x])) {
                fs.mkdirSync(folders[x]);
            }
        }
    },

    uploadAnimation: async function (file) {
        return new Promise(function (resolve, reject) {
            let fileName = '';
            if (
                !fs.existsSync(
                    require('path').resolve(
                        sails.config.appPath,
                        'assets/animations'
                    )
                )
            ) {
                fs.mkdirSync(
                    require('path').resolve(
                        sails.config.appPath,
                        'assets/animations'
                    )
                );
            }
            file.upload(
                {
                    dirname: require('path').resolve(
                        sails.config.appPath,
                        'assets/animations'
                    ),
                    maxBytes: 2000000,
                },
                function whenDone(err, uploadedFiles) {
                    if (err) {
                        return res.serverError(err);
                    }
                    if (uploadedFiles.length === 0) {
                        return res.badRequest('No file was uploaded');
                    }
                    fileName = uploadedFiles[0].fd;
                }
            );
            resolve(fileName);
        });
    },

    uploadImage: async function (prefix, fileName, buffer) {
        this.checkDirectories(prefix);
        var sizes = [
            {
                path: prefix + '/large/' + fileName,
                xy: sails.config.dynamics.LARGE_IMAGE_WIDTH,
            },
            {
                path: prefix + '/medium/' + fileName,
                xy: sails.config.dynamics.MEDIUM_IMAGE_WIDTH,
            },
            {
                path: prefix + '/small/' + fileName,
                xy: sails.config.dynamics.THUMB_IMAGE_WIDTH,
            },
        ];
        return new Promise(function (resolve, reject) {
            async.parallel(
                [
                    function (done) {
                        sharp(buffer)
                            .resize(sizes[0].xy, sizes[0].xy)
                            .jpeg({
                                quality:
                                    sails.config.dynamics.IMAGE_QUALITY * 10,
                            })
                            .toFile(sizes[0].path)
                            .then(({ data, info }) => {
                                return done(null);
                            })
                            .catch((err) => {
                                sails.sentry.captureException(err);
                                done(err);
                            });
                    },
                    function (done) {
                        sharp(buffer)
                            .resize(sizes[1].xy, sizes[1].xy)
                            .jpeg({
                                quality:
                                    sails.config.dynamics.IMAGE_QUALITY * 10,
                            })
                            .toFile(sizes[1].path)
                            .then(({ data, info }) => {
                                return done(null);
                            })
                            .catch((err) => {
                                sails.sentry.captureException(err);
                                done(err);
                            });
                    },
                    function (done) {
                        sharp(buffer)
                            .resize(sizes[2].xy, sizes[2].xy)
                            .jpeg({
                                quality:
                                    sails.config.dynamics.IMAGE_QUALITY * 10,
                            })
                            .toFile(sizes[2].path)
                            .then(({ data, info }) => {
                                return done(null);
                            })
                            .catch((err) => {
                                sails.sentry.captureException(err);
                                done(err);
                            });
                    },
                ],
                function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                }
            );
        });
    },

    uploadBanner: async function (prefix, fileName, buffer) {
        this.checkDirectories(prefix);
        var sizes = [
            {
                path: prefix + '/large/' + fileName,
                x: sails.config.dynamics.LARGE_IMAGE_WIDTH,
            },
            {
                path: prefix + '/medium/' + fileName,
                x: sails.config.dynamics.MEDIUM_IMAGE_WIDTH,
            },
            {
                path: prefix + '/small/' + fileName,
                x: sails.config.dynamics.THUMB_IMAGE_WIDTH,
            },
        ];
        return new Promise(function (resolve, reject) {
            async.parallel(
                [
                    function (done) {
                        sharp(buffer)
                            .resize(sizes[0].x)
                            .jpeg({
                                quality:
                                    sails.config.dynamics.IMAGE_QUALITY * 10,
                            })
                            .toFile(sizes[0].path)
                            .then(({ data, info }) => {
                                return done(null);
                            })
                            .catch((err) => {
                                sails.sentry.captureException(err);
                                done(err);
                            });
                    },
                    function (done) {
                        sharp(buffer)
                            .resize(sizes[1].x)
                            .jpeg({
                                quality:
                                    sails.config.dynamics.IMAGE_QUALITY * 10,
                            })
                            .toFile(sizes[1].path)
                            .then(({ data, info }) => {
                                return done(null);
                            })
                            .catch((err) => {
                                sails.sentry.captureException(err);
                                done(err);
                            });
                    },
                    function (done) {
                        sharp(buffer)
                            .resize(sizes[2].x)
                            .jpeg({
                                quality:
                                    sails.config.dynamics.IMAGE_QUALITY * 10,
                            })
                            .toFile(sizes[2].path)
                            .then(({ data, info }) => {
                                return done(null);
                            })
                            .catch((err) => {
                                sails.sentry.captureException(err);
                                done(err);
                            });
                    },
                ],
                function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                }
            );
        });
    },

    uploadFileImage: async function (file, folder) {
        this.checkDirectoriesOld(folder);
        return new Promise(function (resolve, reject) {
            file.upload(
                {
                    dirname: path.resolve(
                        sails.config.appPath,
                        'assets/uploads/temp/'
                    ),
                    maxBytes: sails.config.dynamics.MEDIA_SIZE,
                },
                function (err, uploadedFile) {
                    if (err) {
                        reject(new Error(err));
                    }
                    if (uploadedFile.length === 0) {
                        reject(new Error('Unable to upload file'));
                    }
                    let f = uploadedFile[0].fd;
                    let fileName = f.replace(/^.*[\\\/]/, '');
                    var sizes = [
                        {
                            path:
                                sails.config.appPath +
                                '/assets/uploads' +
                                folder +
                                '/large/' +
                                fileName,
                            xy: sails.config.dynamics.LARGE_IMAGE_WIDTH,
                        },
                        {
                            path:
                                sails.config.appPath +
                                '/assets/uploads' +
                                folder +
                                '/medium/' +
                                fileName,
                            xy: sails.config.dynamics.MEDIUM_IMAGE_WIDTH,
                        },
                        {
                            path:
                                sails.config.appPath +
                                '/assets/uploads' +
                                folder +
                                '/small/' +
                                fileName,
                            xy: sails.config.dynamics.THUMB_IMAGE_WIDTH,
                        },
                    ];
                    async.parallel(
                        [
                            function (done) {
                                sharp(
                                    path.resolve(
                                        sails.config.appPath,
                                        'assets/uploads/temp/' + fileName
                                    )
                                )
                                    .resize(sizes[0].xy, sizes[0].xy)
                                    .jpeg({
                                        quality:
                                            sails.config.dynamics
                                                .IMAGE_QUALITY * 10,
                                    })
                                    .toFile(sizes[0].path)
                                    .then(({ data, info }) => {
                                        return done(null);
                                    })
                                    .catch((err) => {
                                        sails.sentry.captureException(err);
                                        done(err);
                                    });
                            },
                            function (done) {
                                sharp(
                                    path.resolve(
                                        sails.config.appPath,
                                        'assets/uploads/temp/' + fileName
                                    )
                                )
                                    .resize(sizes[1].xy, sizes[1].xy)
                                    .jpeg({
                                        quality:
                                            sails.config.dynamics
                                                .IMAGE_QUALITY * 10,
                                    })
                                    .toFile(sizes[1].path)
                                    .then(({ data, info }) => {
                                        return done(null);
                                    })
                                    .catch((err) => {
                                        sails.sentry.captureException(err);
                                        done(err);
                                    });
                            },
                            function (done) {
                                sharp(
                                    path.resolve(
                                        sails.config.appPath,
                                        'assets/uploads/temp/' + fileName
                                    )
                                )
                                    .resize(sizes[2].xy, sizes[2].xy)
                                    .jpeg({
                                        quality:
                                            sails.config.dynamics
                                                .IMAGE_QUALITY * 10,
                                    })
                                    .toFile(sizes[2].path)
                                    .then(({ data, info }) => {
                                        return done(null);
                                    })
                                    .catch((err) => {
                                        sails.sentry.captureException(err);
                                        done(err);
                                    });
                            },
                        ],
                        function (err) {
                            if (err) {
                                reject(err);
                            }
                            fs.unlinkSync(
                                path.resolve(
                                    sails.config.appPath,
                                    'assets/uploads/temp/' + fileName
                                )
                            );
                            resolve(fileName);
                        }
                    );
                }
            );
        });
    },
    checkForBusinessHours: async function (provider, day, offset) {
        let hours = await ProviderBusinessHours.find({
            created_by: provider,
        }).limit(1);
        if (hours && hours.length > 0) {
            var mainFetchPacket = null;
            for (x in hours[0].timing_packet) {
                if (hours[0].timing_packet[x].key == day) {
                    mainFetchPacket = hours[0].timing_packet[x];
                }
            }
            if (
                typeof mainFetchPacket != 'undefined' &&
                mainFetchPacket != null &&
                mainFetchPacket.status
            ) {
                if (
                    typeof mainFetchPacket.startTime != 'undefined' &&
                    typeof mainFetchPacket.endTime != 'undefined'
                ) {
                    let hh = moment().utcOffset(-offset).format('HH');
                    let mm = moment().utcOffset(-offset).format('MM');
                    hh = hh * 3600;
                    mm = mm * 60;
                    const match = hh + mm;
                    if (
                        mainFetchPacket.startTime < match &&
                        mainFetchPacket.endTime > match
                    ) {
                        return true;
                    }
                    return false;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
};
