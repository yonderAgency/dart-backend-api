/**
 * Policy Mappings
 */

var policies = {
    'booking/my': ['verifyUser'],
    'booking/stop': ['verifyUser'],
    'booking/start': ['verifyUser'],
    'booking/pause': ['verifyUser'],
    'booking/detail': ['verifyUser'],
    'booking/create': ['verifyUser'],
    'booking/accept': ['verifyUser'],
    'booking/reject': ['verifyUser'],
    'booking/rebook': ['verifyUser'],
    'booking/rebook-check': ['verifyUser'],
    'booking/cancel': ['verifyUser'],
    'booking/gettoggle': ['verifyUser'],

    'booking/delivery/list': ['isGuest'],
    'booking/delivery/change': ['isGuest'],
    'booking/delivery/help': ['isGuest'],
    'booking/delivery/detail': ['isGuest'],
    'booking/delivery/sendrequest': ['verifyUser'],

    'booking/provider-approve': ['verifyUser'],

    'cards/list': ['verifyUser'],
    'cards/create': ['verifyUser'],
    'cards/remove': ['verifyUser'],

    'category/top': ['isGuest'],
    'category/list': ['isGuest'],
    'category/services': ['isGuest'],
    'category/allservices': ['isGuest'],

    'inbox/my': ['verifyUser'],
    'inbox/add': ['verifyUser'],
    'inbox/image': ['verifyUser'],
    'inbox/detail': ['verifyUser'],
    'inbox/refresh': ['verifyUser'],

    'favorite/my': ['verifyUser'],
    'favorite/create': ['verifyUser'],

    'faq/list': ['isGuest'],
    'faq/detail': ['verifyUser'],
    'faq/create': ['verifyUser'],
    'faq/update': ['verifyUser'],
    'faq/delete': ['verifyUser'],

    'package/detail': ['verifyUser'],
    'package/create': ['verifyUser'],
    'package/update': ['verifyUser'],
    'package/delete': ['verifyUser'],

    'notifications/list': ['verifyUser'],
    'notifications/read': ['verifyUser'],

    'payment/create': ['verifyUser'],
    'payment/wallet': ['verifyUser'],

    'provider/list': true,
    'provider/search': ['isGuest'],
    'provider/search-main': ['isGuest'],
    'provider/best-rated': ['isGuest'],
    'provider/timings': ['verifyUser'],
    'provider/bookings': ['verifyUser'],
    'provider/dashboard': ['verifyUser'],
    'provider/earning': ['verifyUser'],
    'provider/checkslots': ['isGuest'],
    'provider/update-timings': ['verifyUser'],
    'provider/update-profile': ['verifyUser'],
    'provider/upload-docs': ['verifyUser'],
    'provider/list-docs': ['verifyUser'],
    'provider/delete-doc': ['verifyUser'],
    'provider/download-doc': ['verifyUser'],

    'user/add-stripe': ['verifyUser'],

    'profile/login': ['isGuest'],
    'profile/check-provider': ['verifyUser'],

    'profile/update': ['verifyUser'],
    'profile/my-categories': ['verifyUser'],
    'profile/provider-profile': ['verifyUser'],
    'profile/update-profile': ['verifyUser'],

    'service/view': ['isGuest'],
    'service/top': ['isGuest'],

    'provider-service/get': ['isGuest'],
    'provider-service/list': ['isGuest'],
    'provider-service/detail': ['isGuest'],
    'provider-service/add': ['verifyUser'],
    'provider-service/create': ['verifyUser'],
    'provider-service/update': ['verifyUser'],
    'provider-service/update-service': ['verifyUser'],
    'provider-service/status': ['verifyUser'],
    'provider-service/alldata': ['verifyUser'],
    'provider-service/getmine': ['verifyUser'],
    'provider-service/create-media': ['verifyUser'],
    'provider-service/create-media-image': ['verifyUser'],
    'provider-service/create-media-video': ['verifyUser'],

    'pro-service-group/create': ['verifyUser'],
    'pro-service-group/list': ['isGuest'],
    'pro-service-group/update': ['verifyUser'],
    'pro-service-group/create-addon': ['verifyUser'],
    'pro-service-group/update-addon': ['verifyUser'],
    'pro-service-group/delete-addon': ['verifyUser'],
    'pro-service-group/delete': ['verifyUser'],

    'pro-service-package/list': ['verifyUser'],
    'pro-service-package/edit': ['verifyUser'],
    'pro-service-package/create': ['verifyUser'],
    'pro-service-package/update': ['verifyUser'],
    'pro-service-package/delete': ['verifyUser'],

    'rating/get': ['isGuest'],
    'rating/add': ['verifyUser'],

    'cms/list': ['isGuest'],
    'cms/cities': ['isGuest'],
    'cms/view': ['isGuest'],

    'settings/fetch': ['isGuest'],

    'promocodes/top': ['isGuest'],
    'promocodes/fetch': ['isGuest'],
    'promocodes/check': ['verifyUser'],

    'cart/add': ['verifyUser'],
    'cart/fetch': ['verifyUser'],
    'cart/update': ['verifyUser'],
    'cart/delete-item': ['verifyUser'],
    'cart/check-address': ['verifyUser'],

    'user/login': ['isGuest'],
    'user/signup': ['isGuest'],
    'user/search': ['isGuest'],
    'user/logout': ['isGuest'],
    'user/list': ['verifyUser'],
    'user/check': ['verifyUser'],
    'user/weblogin': ['isGuest'],
    'user/check-otp': ['isGuest'],
    'user/reactivate': ['isGuest'],
    'user/location': ['verifyUser'],
    'user/social-login': ['isGuest'],
    'user/upload-pic': ['verifyUser'],
    'user/deactivate': ['verifyUser'],
    'user/reset-password': ['isGuest'],
    'user/check-emailotp': ['isGuest'],
    'user/forgot-password': ['isGuest'],
    'user/provider-detail': ['isGuest'],
    'user/nearby-providers': ['isGuest'],
    'user/check-forgot-otp': ['isGuest'],
    'user/customer-update': ['verifyUser'],
    'user/change-password': ['verifyUser'],
    'user/change-language': ['verifyUser'],
    'user/featured-providers': ['isGuest'],
    'user/recent-providers': ['verifyUser'],
    'user/dobcheck': ['isGuest'],

    'user-address/list': ['verifyUser'],
    'user-address/delete': ['verifyUser'],
    'user-address/update': ['verifyUser'],
    'user-address/create': ['verifyUser'],

    'favoriteservice/create': ['verifyUser'],

    'provider-url/list': ['verifyUser'],
    'provider-url/create': ['verifyUser'],
    'provider-url/detail': ['verifyUser'],
    'provider-url/update': ['verifyUser'],
    'provider-url/delete': ['verifyUser'],

    'wallet/list': ['verifyUser'],
    'wallet/add-amount': ['verifyUser'],

    'helpdesk/get': ['verifyuser'],
    'helpdesk/add': ['verifyuser'],
    'helpdesk/view': ['verifyuser'],
    'helpdesk/contact': ['isGuest'],

    'cms/list': ['isGuest'],
    'cms/view': ['isGuest'],

    'settings/bannerlist': ['isGuest'],

    'transaction/list': ['verifyUser'],

    'service/list': ['isGuest'],

    'welcome/content': ['isGuest'],

    //Admin
    'admin/dashboard/index': ['isAdmin'],

    'admin/my/profile': true,
    'admin/my/check': ['isAdmin'],
    'admin/my/login': ['isAdmin'],
    'admin/my/update': ['isAdmin'],
    'admin/my/detail': ['isAdmin'],
    'admin/my/change-password': ['isAdmin'],

    'admin/banners/list': ['isAdmin'],
    'admin/banners/create': ['isAdmin'],
    'admin/banners/update': ['isAdmin'],
    'admin/banners/deleted': ['isAdmin'],

    'admin/provider/pay': ['isAdmin'],
    'admin/provider/charges': ['isAdmin'],

    'admin/address/list': ['isAdmin'],
    'admin/address/status': ['isAdmin'],
    'admin/address/restore': ['isAdmin'],
    'admin/address/deleted': ['isAdmin'],

    'admin/delivery/create': ['isAdmin'],
    'admin/delivery/list': ['isAdmin'],
    'admin/delivery/detail': ['isAdmin'],
    'admin/delivery/update': ['isAdmin'],

    'admin/booking/all': ['isAdmin'],
    'admin/booking/list': ['isAdmin'],
    'admin/booking/detail': ['isAdmin'],

    'admin/cities/list': ['isAdmin'],
    'admin/cities/view': ['isAdmin'],
    'admin/cities/create': ['isAdmin'],
    'admin/cities/update': ['isAdmin'],
    'admin/cities/restore': ['isAdmin'],
    'admin/cities/deleted': ['isAdmin'],

    'admin/category/list': ['isAdmin'],
    'admin/category/view': ['isAdmin'],
    'admin/category/create': ['isAdmin'],
    'admin/category/update': ['isAdmin'],
    'admin/category/restore': ['isAdmin'],
    'admin/category/deleted': ['isAdmin'],

    'admin/customer/restore': ['isAdmin'],
    'admin/customer/deleted': ['isAdmin'],
    'admin/customer/dashboard': ['isAdmin'],
    'admin/customer/update-profile': ['isAdmin'],

    'admin/favorite/get': true,
    'admin/favorite/list': ['isAdmin'],

    'admin/gallery/list': ['isAdmin'],
    'admin/gallery/vlist': ['isAdmin'],
    'admin/gallery/status': ['isAdmin'],
    'admin/gallery/vstatus': ['isAdmin'],
    'admin/gallery/deleted': ['isAdmin'],
    'admin/gallery/vdeleted': ['isAdmin'],

    'admin/provider/detail': ['isAdmin'],
    'admin/provider/gallery': ['isAdmin'],
    'admin/provider/timings': ['isAdmin'],
    'admin/provider/restore': ['isAdmin'],
    'admin/provider/deleted': ['isAdmin'],
    'admin/provider/services': ['isAdmin'],
    'admin/provider/bookings': ['isAdmin'],
    'admin/provider/dashboard': ['isAdmin'],
    'admin/provider/addresses': ['isAdmin'],
    'admin/provider/businesshours': ['isAdmin'],
    'admin/provider/update-profile': ['isAdmin'],
    'admin/provider/provider-service': ['isAdmin'],

    'admin/provider/list-docs': ['isAdmin'],
    'admin/provider/delete-doc': ['isAdmin'],
    'admin/provider/download-doc': ['isAdmin'],

    'admin/promocode/list': ['isAdmin'],
    'admin/promocode/view': ['isAdmin'],
    'admin/promocode/create': ['isAdmin'],
    'admin/promocode/update': ['isAdmin'],
    'admin/promocode/deleted': ['isAdmin'],
    'admin/promocode/restore': ['isAdmin'],

    'admin/rating/all': ['isAdmin'],
    'admin/rating/list': ['isAdmin'],
    'admin/rating/status': ['isAdmin'],
    'admin/rating/deleted': ['isAdmin'],
    'admin/rating/restore': ['isAdmin'],

    'admin/settings/list': ['isGuest'],
    'admin/settings/update-color': ['isAdmin'],
    'admin/settings/update-basic': ['isAdmin'],
    'admin/settings/update-website': ['isAdmin'],
    'admin/settings/update-helpdesk': ['isAdmin'],
    'admin/settings/update-thirdparty': ['isAdmin'],
    'admin/settings/update-notifications': ['isAdmin'],

    'admin/service/list': ['isAdmin'],
    'admin/service/view': ['isAdmin'],
    'admin/service/create': ['isAdmin'],
    'admin/service/deleted': ['isAdmin'],
    'admin/service/update': ['isAdmin'],
    'admin/service/restore': ['isAdmin'],

    'admin/godsview/list': ['isAdmin'],

    'admin/transaction/all': ['isAdmin'],
    'admin/transaction/list': ['isAdmin'],

    'admin/user/list': ['isAdmin'],
    'admin/user/login': ['isAdminGuest'],
    'admin/user/detail': ['isAdmin'],
    'admin/user/logout': ['isAdmin'],
    'admin/user/make-featured': ['isAdmin'],
    'admin/user/customer-create': ['isAdmin'],
    'admin/user/provider-create': ['isAdmin'],
    'admin/user/subadmin-create': ['isAdmin'],
    'admin/user/subadmin-update': ['isAdmin'],
    'admin/user/featured-providers': ['isAdmin'],
    'admin/user/subadmin-assign': ['isAdmin'],
    'admin/user/assign-update': ['isAdmin'],
    'admin/user/update-address': ['isAdmin'],

    'admin/wallet/list': ['isAdmin'],

    'admin/cms/list': ['isAdmin'],
    'admin/cms/view': ['isAdmin'],
    'admin/cms/create': ['isAdmin'],
    'admin/cms/update': ['isAdmin'],
    'admin/cms/restore': ['isAdmin'],
    'admin/cms/deleted': ['isAdmin'],

    'admin/admin-settings/list': ['isAdminGuest'],
    'admin/admin-settings/update': ['isAdmin'],

    'admin/helpdesk/get': ['isAdmin'],
    'admin/helpdesk/view': ['isAdmin'],
    'admin/helpdesk/reply': ['isAdmin'],
    'admin/helpdesk/update': ['isAdmin'],
    'admin/provider/add-bank': ['isAdmin'],

    'admin/wallet/setall': true,

    'cities/list': ['isGuest'],
    'cities/view': ['isGuest'],
    'admin/delivery/add-bank': ['isAdmin'],

    //Test
    'test/email': ['verifyUser']
};

try {
    var p = require('../api/deliveryConfig/deliveryPolicies');
    for (let x in p.deliveryPolicies) {
        policies[x] = p.deliveryPolicies[x];
    }
    module.exports.policies = policies;
} catch (ex) {
    module.exports.policies = policies;
}
