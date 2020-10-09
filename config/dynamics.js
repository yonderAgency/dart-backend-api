module.exports.dynamics = {
    //Website Major
    COMPANY_NAME: 'Miracle Studios Pvt. Ltd.',
    APPLICATION_NAME: 'JerryOnDemand',
    WEBSITE_LOGO: 'website-logo.png',
    DEFAULT_COUNTRY: 'US',
    DEFAULT_COUNTRY_CODE: 1,
    MAINTAINENCE_MODE: false,
    SEO_TITLE: 'JerryOnDemand',
    SEO_DESCRIPTION: 'JerryOnDemand',
    SEO_KEYWORDS: 'JerryOnDemand',
    ADMIN_EMAIL: 'admin@jerryondemand.com',
    ADDRESS_LINE1: 'Tower D, 3rd Floor, DLF Building,',
    ADDRESS_LINE2: 'Rajeev Gandhi IT Park, Chandigarh-160101',
    PHONE_NUMBER: '+91 8699029300',
    SKYPEID: 'social@jerryondemand.com',
    FACEBOOK: '',
    INSTAGRAM: '',
    YOUTUBE: '',
    LINKEDIN: '',
    ABOUT_US: 'Miracle Studios Pvt. Ltd.',
    ANDROID_CUSTOMER_APP_LINK: '',
    IOS_CUSTOMER_APP_LINK: '',
    ANDROID_PROVIDER_APP_LINK: '',
    IOS_PROVIDER_APP_LINK: '',
    ANDROID_DELIVERY_APP_LINK: '',
    IOS_DELIVERY_APP_LINK: '',

    DELIVERY_COST: 30,
    MINIMUM_ORDER_AMOUNT: 100,

    //Media Count Checks
    SERVICE_COUNT: 3,
    MEDIA_COUNT: 3,
    PACKAGE_COUNT: 3,
    CARD_LIMIT: 10,
    MEDIA_SIZE: 10000000,
    SEARCH_RADIUS: 30000,
    CANCELLATION_MINUTES: 150,
    CANCELLATION_FEE: 2,

    //Languages
    LANGUAGES: [
        {
            name: 'English',
            language: 'en',
            rtl: false
        }
    ],

    //KEYS
    WALLET_PREFIX: 'JERRW',
    BOOKING_PREFIX: 'JERRB',
    ADMIN_COLOR_SCHEME: 'PINK',
    DEFAULT_ADMIN_CUT: 5,
    GOOGLE_MAP_KEY: '***GOOGLE-MAP-KEY***',
    WALLET_ACTIVE: true,
    CARD_ACTIVE: true,
    COD_ACTIVE: true,
    AWS_BUCKET_ACTIVE: false,
    AWS_BUCKET_URL: '',
    AWS_BUCKET_KEY: '',
    AWS_BUCKET_SECRET: '',
    AWS_BUCKET_NAME: '',
    
    DIME_KEY: 'api_1ggPkMndHakwEmIrn7pIpfpwmWx',

    //Image Settings
    IMAGE_QUALITY: 7,
    THUMB_IMAGE_WIDTH: 100,
    THUMB_IMAGE_HEIGHT: 100,
    MEDIUM_IMAGE_WIDTH: 500,
    MEDIUM_IMAGE_HEIGHT: 500,
    LARGE_IMAGE_WIDTH: 1000,
    LARGE_IMAGE_HEIGHT: 1000,

    //Payment Gateway Keys
    CURRENCY: 'usd',
    CURRENCY_SYMBOL: '$',
    PAYMENT_GATEWAY: 'stripe',
    STRIPE_SECRET: '***STRIPE-SECRET***',
    STRIPE_PUBLIC: '***STRIPE-PUBLIC***',

    //Onesignal Keys
    ONESIGNAL_AUTH_KEY: '***ONESIGNAL-AUTH-KEY***',
    ONESIGNAL_CUSTOMER_APP_ID: '***ONESIGNAL-CUSTOMER-ID***',
    ONESIGNAL_PROVIDER_APP_ID: '***ONESIGNAL-PROVIDER-ID***',
    ONESIGNAL_REST_CUSTOMERKEY:
        '***ONESIGNAL-CUSTOMER-RESTKEY***',
    ONESIGNAL_REST_PROVIDERKEY:
        '***ONESIGNAL-PROVIDER-RESTKEY***',

    //Twilio
    TWILIO_ACCOUNT_SID: 'TWILIO-ACCOUNT-SID',
    TWILIO_AUTH_TOKEN: 'AUTH-TOKEN',
    TWILIO_PHONE: 'TWILIO-REGISTERED-PHONE',

    //IPStackKey
    IP_STACK_KEY: 'IP-STACK-KEY',

    //Rating
    AR: 'Average Rating',
    R1: 'Tools',
    R2: 'Work Quality',
    R3: 'Behaviour',

    FAKE_DOMAINS: ['yopmail', 'mailinator'],

    //Notifications
    NOTIFICATIONS: {
        NEW_BOOKING_REQUEST: 'You have a new order request from _',
        BOOKING_ACCEPTED: 'Your order request has been accepted by _',
        BOOKING_REJECTED:
            'Your order request has been rejected by _. Please try later or try order any other provider',
        BOOKING_STARTED: '_ is on his way',
        BOOKING_ENDED: 'Your order has been delivered successfully by _',
        BOOKING_RESTARTED: 'Your order has been resumed by _',
        BOOKING_PAUSED: 'Your order has been paused by _',
        BOOKING_COMPLETED_CUSTOMER:
            'Your order has been delivered, thankyou for choosing our service!',
        BOOKING_COMPLETED_PROVIDER: 'Your order is ready for pickup!',
        BOOKING_MINS_REMINDER: 'You have a pending order request from _',
        BOOKING_DELAYED_REMINDER:
            'Your order request with _ is still not accepted. We suggest to cancel it and book some other provider.',
        NEW_MESSAGE: 'You have a new message from _',
        NEW_OFFER: 'We have a new offer for you!',
        BOOKING_CANCELLED: 'Order request cancelled',
        BOOKING_MINS_CANCEL_REMINDER:
            'You have a pending order request from _. It will be automatically cancelled in 5 minutes.',
        BOOKING_DELAYED_CANCEL_REMINDER:
            'Your order request with _ is still not accepted. It will be automatically cancelled in 5 minutes.',
        BOOKING_AUTO_CANCEL: 'Order request cancelled by the system',
        DELIVERY_ACCEPTED: '_ will be the delivery guy for your order',
        BOOKING_DELIVERY_REMINDER:
            'No delivery guy has accepted your order (_), click on Send Delivery Request to try again'
    },

    //Notifications
    NOTIFICATIONS_HEADING: {
        NEW_BOOKING_REQUEST: 'New order request',
        BOOKING_ACCEPTED: 'Order accepted',
        BOOKING_REJECTED: 'Order rejected',
        BOOKING_STARTED: 'Order Dispatched',
        BOOKING_ENDED: 'Order Delivered',
        BOOKING_RESTARTED: 'Order Resumed',
        BOOKING_PAUSED: 'Order Paused',
        BOOKING_COMPLETED_CUSTOMER: 'Order Completed',
        BOOKING_COMPLETED_PROVIDER: 'Order is ready',
        BOOKING_MINS_REMINDER: 'Order Reminder',
        BOOKING_DELAYED_REMINDER: 'Order Reminder',
        NEW_MESSAGE: 'New Message',
        NEW_OFFER: 'New Offer!',
        BOOKING_CANCELLED: 'Order cancelled',
        BOOKING_MINS_CANCEL_REMINDER: 'Order cancellation reminder',
        BOOKING_DELAYED_CANCEL_REMINDER: 'Alert! Order cancellation reminder',
        BOOKING_AUTO_CANCEL: 'Order request cancelled',
        DELIVERY_ACCEPTED: 'Delivery guy assigned',
        BOOKING_DELIVERY_REMINDER: 'No delivery guy assigned!'
    },

    //Help Desk
    HELPDESK_MESSAGES: [
        {
            id: 1,
            message: 'Issue with booking'
        },
        {
            id: 2,
            message: 'Issue with payments'
        },
        {
            id: 3,
            message: 'Issue with wallet'
        },
        {
            id: 4,
            message: 'Issue with application'
        },
        {
            id: 5,
            message: 'Feedback'
        },
        {
            id: 6,
            message: 'Other'
        }
    ],

    //App Color
    COLORS: {
        BACKGROUND: {
            HEX: '#eef2f5',
            RGB1: 'rgba(238,242,245,1)',
            RGB2: 'rgba(238,242,245,0)'
        },
        SECONDARY: {
            HEX: '#f42156',
            RGB1: 'rgba(244,33,86,1)',
            RGB2: 'rgba(244,33,86,0)'
        },
        MONEY: {
            HEX: '#41c7a8',
            RGB1: 'rgba(65,199,168,1)',
            RGB2: 'rgba(65,199,168,0)'
        },
        RATING: {
            HEX: '#e78d26',
            RGB1: 'rgba(231,141,38,1)',
            RGB2: 'rgba(231,141,38,0)'
        },
        ICON_LIGHT: {
            HEX: '#b6c1d3',
            RGB1: 'rgba(182,193,211,1)',
            RGB2: 'rgba(182,193,211,0)'
        },
        LIGHT: {
            HEX: '#FDFDFD',
            RGB1: 'rgba(253,253,253,1)',
            RGB2: 'rgba(253,253,253,0)'
        },
        DARK: {
            HEX: '#323A45',
            RGB1: 'rgba(50,58,69,1)',
            RGB2: 'rgba(50,58,69,0)'
        },
        LOADING_PRIMARY: {
            HEX: '#EEEEEE',
            RGB1: 'rgba(238,238,238,1)',
            RGB2: 'rgba(238,238,238,0)'
        },
        LOADING_SECONDARY: {
            HEX: '#FFF',
            RGB1: 'rgba(238,238,238,1)',
            RGB2: 'rgba(255,255,255,0)'
        },
        PRIMARY: {
            HEX: '#252B33',
            RGB1: 'rgba(37,43,51,1)',
            RGB2: 'rgba(37,43,51,0)'
        }
    }
};
