/**
 * ProviderBusinessHours.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        timing_packet: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [
                {
                    key: '0',
                    day: 'Sunday',
                    startTime: 25200,
                    endTime: 72000,
                    status: false
                },
                {
                    key: '1',
                    day: 'Monday',
                    startTime: 25200,
                    endTime: 72000,
                    status: true
                },
                {
                    key: '2',
                    day: 'Tuesday',
                    startTime: 25200,
                    endTime: 72000,
                    status: true
                },
                {
                    key: '3',
                    day: 'Wednesday',
                    startTime: 25200,
                    endTime: 72000,
                    status: true
                },
                {
                    key: '4',
                    day: 'Thursday',
                    startTime: 25200,
                    endTime: 72000,
                    status: true
                },
                {
                    key: '5',
                    day: 'Friday',
                    startTime: 25200,
                    endTime: 72000,
                    status: true
                },
                {
                    key: '6',
                    day: 'Saturday',
                    startTime: 25200,
                    endTime: 72000,
                    status: true
                }
            ]
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        type_id: {
            type: 'number',
            defaultsTo: 1
        },
        created_at: {
            type: 'number'
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2
        },
        created_by: {
            required: true,
            type: 'string'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    addHours: async function(id) {
        await ProviderBusinessHours.create({
            created_by: id
        })
    },

    setHours: function(time) {
        const splitTime = time.split(':');
        var hours = splitTime[0];
        const mix = splitTime[1].split(' ');
        const minutes = mix[0];
        const meridian = mix[1];
        if (meridian == 'PM') {
            hours = 12 + Number(hours);
        }
        return hours * 3600 + minutes * 60;
    },

    convertTime: function(time) {
        var sec_num = parseInt(time, 10);
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);

        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var meridian = 'AM';
        if (hours > 12) {
            hours = hours - 12;
            meridian = 'PM';
        }
        return hours + ':' + minutes + ' ' + meridian;
    },

    getJson: async function(req) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['timing_packet'] = api.checkAttribute(req.timing_packet);
        if (req.timing_packet.length > 0) {
            for (x in req.timing_packet) {
                req.timing_packet[
                    x
                ].startTime = this.convertTime(
                    req.timing_packet[x].startTime
                );
                req.timing_packet[
                    x
                ].endTime = this.convertTime(
                    req.timing_packet[x].endTime
                );
            }
        }
        json['type_id'] = api.checkAttribute(req.type_id);
        json['status'] = api.checkAttribute(req.status);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['is_deleted'] = api.checkAttribute(req.is_deleted);
        return json;
    }
};
