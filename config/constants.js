module.exports.constants = {
    BASE_URL: 'https://afternoon-fjord-00481.herokuapp.com//8081',
    DISTRIBUTION_KEY: '4NZKjdgiQRDXIhq9TrnUTLuwoN5pZ6Dx',
    DELIVERY_URL: 'https://foodjunkies.miraclechd.co:6542/',
    DELIVERY_KEY:
        'SET_THE_SAME_IN_DELIVERY_API_BASE',

    LOCALE: 'en',
    REFUND_TIME_IN_HOURS: 72,

    STATUS_ACTIVE: 1,
    STATUS_INACTIVE: 2,

    SOCIAL_LOGIN_FACEBOOK: 1,
    SOCIAL_LOGIN_GOOGLE: 2,
    SOCIAL_LOGIN_APPLE: 3,

    DELIVERY_TYPE_DELIVERY: 1,
    DELIVERY_TYPE_PICKUP: 2,

    IS_DELETED: 1,
    IS_ACTIVE: 2,

    IS_INDIVIDUAL: 1,
    IS_COMPANY: 2,

    IS_BLOCKED: 1,
    IS_UNBLOCKED: 2,

    IS_UNDER_REVIEW: 2,
    NOT_UNDER_REVIEW: 1,

    PROFILE_INCOMPLETE_EMAIL: 1,
    PROFILE_INCOMPLETE_PHONE: 2,
    PROFILE_INCOMPLETE_ADDRESS: 3,
    PROFILE_INCOMPLETE_SERVICES: 4,
    PROFILE_COMPLETED: 5,

    LOCATION_TYPE_GPS: 1,
    LOCATION_TYPE_IP: 2,

    FAVORITE_COMMON: 1,
    FAVORITE_DEFAULT: 2,

    IS_FEATURED: 1,
    NORMAL_USER: 2,

    READ_TRUE: 1,
    READ_FALSE: 2,

    GRAPH_TYPE_DAILY: 1,
    GRAPH_TYPE_MONTHLY: 2,
    GRAPH_TYPE_YEARLY: 3,
    GRAPH_TYPE_CUSTOM: 4,

    AUTH_TYPE_SUCCESS: 1,
    AUTH_TYPE_INVALID: 2,
    AUTH_TYPE_MAINTAINENCE: 3,
    AUTH_TYPE_DEACTIVATED: 4,
    AUTH_TYPE_BLOCKED: 5,

    ROLE_ADMIN: 999,
    ROLE_SUBADMIN: 888,
    ROLE_PROVIDER: 840,
    ROLE_EMPLOYEE: 700,
    ROLE_CUSTOMER: 420,

    PAYMENT_SUCCESS: 1,
    PAYMENT_FAILED: 2,
    PAYMENT_PENDING: 3,
    PAYMENT_CANCELLED: 4,

    TRANSACTION_INVALID_CARD: 1,
    TRANSACTION_FAILED: 2,
    TRANSACTION_PENDING: 3,
    TRANSACTION_CANCELLED: 4,
    TRANSACTION_SUCCESS: 5,

    BOOKING_TYPE_CASH: 1,
    BOOKING_TYPE_CARD: 2,
    BOOKING_TYPE_WALLET: 3,

    TRANSACTION_REFERENCE_TYPE_BOOKING: 1,

    TRANSACTION_REFERENCE_MEDIUM_CASH: 1,
    TRANSACTION_REFERENCE_MEDIUM_CARD: 2,
    TRANSACTION_REFERENCE_MEDIUM_WALLET: 3,

    PAYMENT_BEFORE: 1,
    PAYMENT_AFTER: 2,

    BOOKING_STATUS_INCART: 1,
    BOOKING_STATUS_INITIATED: 2,
    BOOKING_STATUS_CANCELLED: 3,
    BOOKING_STATUS_REJECTED: 4,
    BOOKING_STATUS_CONFIRMED: 5,
    BOOKING_STATUS_STARTED: 6,
    BOOKING_STATUS_PAUSED: 7,
    BOOKING_STATUS_ENDED: 8,
    BOOKING_STATUS_COMPLETED: 9,
    BOOKING_STATUS_CANCELLED_PROVIDER: 10,

    BOOKING_ITEMTYPE_PACKAGE: 1,
    BOOKING_ITEMTYPE_PER_HOUR: 2,

    WALLET_TRANSACTION_SUCCESS: 1,
    WALLET_TRANSACTION_FAILED: 2,

    WALLET_TOPUP: 1,
    WALLET_DEDUCTION: 2,

    PROVIDER_BOOKING_VIEW_ALL: 0,
    PROVIDER_BOOKING_VIEW_NEW: 1,
    PROVIDER_BOOKING_VIEW_INPROGRESSS: 2,
    PROVIDER_BOOKING_VIEW_COMPLETED: 3,
    PROVIDER_BOOKING_VIEW_CANCELLED: 4,

    RATING_CUSTOMER_TO_PROVIDER: 1,
    RATING_PROVIDER_TO_CUSTOMER: 2,

    HAS_REVIEWED_TRUE: 1,
    HAS_REVIEWED_FALSE: 2,

    HELPDESK_STATUS_PENDING: 1,
    HELPDESK_STATUS_INPROGRESS: 2,
    HELPDESK_STATUS_CLOSED: 3,

    HELPDESK_TYPE_VALID: 1,
    HELPDESK_TYPE_INVALID: 2,

    SETTINGS_TYPE_BASIC: 1,
    SETTINGS_TYPE_COLOR_SCHEME: 2,
    SETTINGS_TYPE_WEBSITE: 3,
    SETTINGS_TYPE_THIRD_PARTY: 4,
    SETTINGS_TYPE_NOTIFICATIONS: 5,
    SETTINGS_TYPE_HELPDESK: 6,

    NOTIFICATION_STATUS_FOR_ALL: 1,
    NOTIFICATION_STATUS_FOR_PROVIDERS: 2,
    NOTIFICATION_STATUS_FOR_CUSTOMERS: 3,
    NOTIFICATION_STATUS_FOR_INDIVIDUAL: 4,

    DEFAULT_LATITUDE: 37.0901,
    DEFAULT_LONGITUDE: -95.7128,

    RECENT_CHECK_MILLISECONDS: 3600000,

    PROVIDER_FILTER_PRICE_ACCENDING: 2,
    PROVIDER_FILTER_PRICE_DESENDING: 1,
    PROVIDER_FILTER_RATING: 3,
    PROVIDER_FILTER_NAME_A: 4,
    PROVIDER_FILTER_NAME_Z: 5,
    PROVIDER_FILTER_DISTANCE: 6,

    PACKAGE_ACTIVE: true,
    PER_HOUR_ACTIVE: true,

    BOOKING_TIMER_THRESHOLD: 50,

    PROMO_TYPE_SINGLE: 1,
    PROMO_TYPE_UNLIMITED: 2,

    PROMO_OFFERTYPE_APP: 1,
    PROMO_OFFERTYPE_PROMOTION: 2,

    PROMO_ADMIN_TYPE: 1,
    PROMO_PROVIDER_TYPE: 2,

    TIME_PROVIDER_NOTIFY: 90,
    TIME_CUSTOMER_NOTIFY: 300,
    TIME_BOOKING_CANCEL_NOTIFY: 600,
    TIME_BOOKING_CANCEL: 900,

    DEFAULT_FAVORITE_LIST: 'My Favorites',

    RELOAD_BOOKING: 'booking',
    RELOAD_NOTIFICATION: 'notification',
    RELOAD_INBOX: 'inbox',
    RELOAD_OFFERS: 'offers',

    PROVIDER_INBOX_DEFAULT:
        'Thanks for booking, if you have any query message us here!',

    PROMO_NOT_ACTIVE: 'The promo code has not been started yet',
    PROMO_EXPIRED: 'The promo code is expired',
    PROMO_INVALID_CODE: 'Your code is invalid',
    PROMO_INACTIVE_CODE: 'This promo code is inactive',
    PROMO_LIMIT_UP:
        'This promo is used up already, it was available for limited number of users!',
    PROMO_LIMIT_USED_UP:
        'You have already reached maximum limit of this promo code!',
    PROMO_NOT_USED_ONTIME: 'This app offer is expired now',

    GRAPH_MONTHS: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ],

    ROUTE_BOOKING_DETAIL: 'BookingDetail',
    ROUTE_RATE_BOOKING: 'RateBooking',
    ROUTE_MANAGE_SERVICES: 'ManageServices',
    ROUTE_SERVICE_DETAIL: 'ServiceDetail',
    ROUTE_ADD_ADDRESS: 'AddAddress',
    ROUTE_ADD_SERVICE: 'AddServiceCreate',
    ROUTE_ADD_MEDIA: 'AddMedia',
    ROUTE_EDIT_SERVICE_DATA: 'EditServiceData',
    ROUTE_MANAGE_PACKAGES: 'ManagePackages',
    ROUTE_CATEGORIES: 'AddServices',
    ROUTE_PROFILE: 'Profile',
    ROUTE_MANAGE_ADDRESSES: 'ManageAddress',
    ROUTE_UPDATE_ADDRESS: 'UpdateAddress',
    ROUTE_ADD_CATEGORIES: 'Categories',
    ROUTE_INBOX_DETAIL: 'InboxDetail',
    ROUTE_OFFER_LIST: 'Offers',

    WEB_ROUTES: {
        BookingDetail: '/user/booking/detail',
        RateBooking: '/user/booking/detail',
        ManageServices: '/provider/service',
        ServiceDetail: '/provider/service',
        AddAddress: '/user/address/create',
        AddServiceCreate: '/provider/service/create',
        AddMedia: '/provider/service/addmedia',
        EditServiceData: '/provider/service/update',
        ManagePackages: '/provider/service',
        AddServices: '/provider/service',
        Profile: '/user/profile',
        ManageAddress: '/user/address',
        UpdateAddress: '/user/address/update/:addressId',
        Categories: '/provider/service',
        InboxDetail: '/user/profile',
        Offers: '/promocode/list'
    },

    NOTIFICATIONS: {
        NEW_BOOKING_REQUEST: 1,
        BOOKING_ACCEPTED: 2,
        BOOKING_REJECTED: 3,
        BOOKING_STARTED: 4,
        BOOKING_ENDED: 5,
        BOOKING_RESTARTED: 6,
        BOOKING_PAUSED: 7,
        BOOKING_COMPLETED_CUSTOMER: 8,
        BOOKING_COMPLETED_PROVIDER: 9,
        BOOKING_MINS_REMINDER: 10,
        BOOKING_DELAYED_REMINDER: 11,
        NEW_MESSAGE: 12,
        NEW_OFFER: 13,
        BOOKING_CANCELLED: 14,
        BOOKING_MINS_CANCEL_REMINDER: 15,
        BOOKING_DELAYED_CANCEL_REMINDER: 16,
        BOOKING_AUTO_CANCEL: 17,
        DELIVERY_ACCEPTED: 18,
        BOOKING_DELIVERY_REMINDER: 19
    },

    DEFAULT_WELCOME_DATA: [
        {
            title: 'Order from wide range of restaurants',
            sub_title: 'Ready to order from top restaurants?',
            animation_json: 'welcome1.json',
            created_at: '1577082871000'
        },
        {
            title: 'with wide collection of cuisines',
            sub_title: 'Ready to order from top restaurants?',
            animation_json: 'welcome2.json',
            created_at: '1577082871000'
        },
        {
            title: 'delivered quickly at your doorstep',
            sub_title: 'Ready to order from top restaurants?',
            animation_json: 'welcome3.json',
            created_at: '1577082871000'
        }
    ]
};
