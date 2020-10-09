/**
 * Route Mappings
 */

module.exports.routes = {
    '/': {
        view: 'pages/homepage'
    },

    //APIs
    'GET /user/list': 'user.list',
    'GET /user/check': 'user.check',
    'GET /user/search': 'user.search',
    'GET /user/provider-detail': 'user.provider-detail',
    'GET /user/nearby-providers': 'user.nearby-providers',
    'GET /user/recent-providers': 'user.recent-providers',
    'GET /user/featured-providers': 'user.featured-providers',
    'POST /user/login': 'user.login',
    'POST /user/signup': 'user.signup',
    'POST /user/logout': 'user.logout',
    'POST /user/location': 'user.location',
    'POST /user/weblogin': 'user.weblogin',
    'POST /user/check-otp': 'user.check-otp',
    'POST /user/reactivate': 'user.reactivate',
    'POST /user/deactivate': 'user.deactivate',
    'POST /user/upload-pic': 'user.upload-pic',
    'POST /user/social-login': 'user.social-login',
    'POST /user/check-emailotp': 'user.check-emailotp',
    'POST /user/reset-password': 'user.reset-password',
    'POST /user/change-language': 'user.change-language',
    'POST /user/customer-update': 'user.customer-update',
    'POST /user/forgot-password': 'user.forgot-password',
    'POST /user/change-password': 'user.change-password',
    'POST /user/check-forgot-otp': 'user.check-forgot-otp',

    'GET /promocodes/fetch': 'promocodes.fetch',
    'POST /promocodes/top': 'promocodes.top',
    'POST /promocodes/check': 'promocodes.check',

    'GET /settings/bannerlist': 'settings.bannerlist',

    'POST /service/view': 'service.view',
    'GET /service/top': 'service.top',

    'GET /user-address/list': 'user-address.list',
    'POST /user-address/create': 'user-address.create',
    'POST /user-address/update': 'user-address.update',
    'POST /user-address/delete': 'user-address.delete',

    'GET /category/top': 'category.top',
    'GET /category/list': 'category.list',
    'GET /category/allservices': 'category.allservices',
    'POST /category/services': 'category.services',

    'GET /provider-service/get': 'provider-service.get',
    'GET /provider-service/getmine': 'provider-service.getmine',
    'GET /provider-service/detail': 'provider-service.detail',
    'POST /provider/checkslots': 'provider.checkslots',
    'POST /provider-service/list': 'provider-service.list',
    'POST /provider-service/update': 'provider-service.update',
    'POST /provider-service/update-service': 'provider-service.update-service',
    'POST /provider-service/status': 'provider-service.status',
    'POST /provider-service/create': 'provider-service.create',
    'POST /provider-service/add': 'provider-service.add',
    'POST /provider-service/alldata': 'provider-service.alldata',
    'POST /provider-service/create-media': 'provider-service.create-media',
    'POST /provider-service/create-media-image':
        'provider-service.create-media-image',
    'POST /provider-service/create-media-video':
        'provider-service.create-media-video',

    'POST /pro-service-group/create': 'pro-service-group.create',
    'POST /pro-service-group/list': 'pro-service-group.list',
    'POST /pro-service-group/update': 'pro-service-group.update',
    'POST /pro-service-group/create-addon': 'pro-service-group.create-addon',
    'POST /pro-service-group/update-addon': 'pro-service-group.update-addon',
    'POST /pro-service-group/delete': 'pro-service-group.delete',
    'POST /pro-service-group/delete-addon': 'pro-service-group.delete-addon',

    'POST /pro-service-package/create': 'pro-service-package.create',
    'POST /pro-service-package/update': 'pro-service-package.update',
    'POST /pro-service-package/edit': 'pro-service-package.edit',
    'POST /pro-service-package/list': 'pro-service-package.list',
    'POST /pro-service-package/delete': 'pro-service-package.delete',

    'GET /profile/my-categories': 'profile.my-categories',
    'GET /profile/check-provider': 'profile.check-provider',
    'POST /profile/login': 'profile.login',
    'POST /profile/update': 'profile.update',
    'POST /profile/update-profile': 'profile.update-profile',
    'POST /profile/provider-profile': 'profile.provider-profile',

    'GET /faq/list': 'faq.list',
    'POST /faq/detail': 'faq.detail',
    'POST /faq/create': 'faq.create',
    'POST /faq/update': 'faq.update',
    'POST /faq/delete': 'faq.delete',

    'POST /package/detail': 'package.detail',
    'POST /package/create': 'package.create',
    'POST /package/update': 'package.update',
    'POST /package/delete': 'package.delete',

    'GET /cards/list': 'cards.list',
    'POST /cards/create': 'cards.create',
    'POST /cards/remove': 'cards.remove',

    'GET /inbox/my': 'inbox.my',
    'POST /inbox/add': 'inbox.add',
    'POST /inbox/image': 'inbox.image',
    'POST /inbox/detail': 'inbox.detail',
    'POST /inbox/refresh': 'inbox.refresh',

    'GET /favorite/my': 'favorite.my',
    'POST /favorite/create': 'favorite.create',

    'POST /favoriteservice/create': 'favoriteservice.create',

    'GET /rating/get': 'rating.get',
    'POST /rating/add': 'rating.add',

    'GET /booking/my': 'booking.my',
    'GET /booking/detail': 'booking.detail',
    'POST /booking/stop': 'booking.stop',
    'POST /booking/pause': 'booking.pause',
    'POST /booking/start': 'booking.start',
    'POST /booking/gettoggle': 'booking.gettoggle',
    'POST /booking/create': 'booking.create',
    'POST /booking/accept': 'booking.accept',
    'POST /booking/reject': 'booking.reject',
    'POST /booking/rebook': 'booking.rebook',
    'POST /booking/cancel': 'booking.cancel',
    'POST /booking/rebook-check': 'booking.rebook-check',
    'POST /booking/provider-approve': 'booking.provider-approve',

    'POST /booking/delivery/list': 'booking.delivery.list',
    'POST /booking/delivery/help': 'booking.delivery.help',
    'POST /booking/delivery/change': 'booking.delivery.change',
    'POST /booking/delivery/detail': 'booking.delivery.detail',
    'POST /booking/delivery/sendrequest': 'booking.delivery.sendrequest',

    'GET /notifications/list': 'notifications.list',
    'POST /notifications/read': 'notifications.read',

    'POST /payment/create': 'payment.create',
    'POST /payment/wallet': 'payment.wallet',

    'GET /provider/list': 'provider.list',
    'GET /provider/timings': 'provider.timings',
    'GET /provider/bookings': 'provider.bookings',
    'POST /provider/search': 'provider.search',
    'POST /provider/search-main': 'provider.search-main',
    'GET /provider/best-rated': 'provider.best-rated',
    'POST /provider/dashboard': 'provider.dashboard',
    'POST /provider/earning': 'provider.earning',
    'POST /provider/update-timings': 'provider.update-timings',
    'POST /provider/update-profile': 'provider.update-profile',
    'POST /provider/upload-docs': 'provider.upload-docs',
    'GET /provider/list-docs': 'provider.list-docs',
    'POST /provider/delete-doc': 'provider.delete-doc',
    'GET /provider/download-doc': 'provider.download-doc',

    'GET /wallet/list': 'wallet.list',
    'POST /wallet/add-amount': 'wallet.add-amount',

    'GET /cart/fetch': 'cart.fetch',
    'POST /cart/add': 'cart.add',
    'POST /cart/update': 'cart.update',
    'POST /cart/delete-item': 'cart.delete-item',
    'POST /cart/check-address': 'cart.check-address',

    'GET /cms/list': 'cms.list',
    'GET /cms/view': 'cms.view',
    'GET /cms/cities': 'cms.cities',
    'GET /helpdesk/get': 'helpdesk.get',
    'GET /helpdesk/view': 'helpdesk.view',
    'POST /helpdesk/add': 'helpdesk.add',

    'POST /provider-url/list': 'provider-url.list',
    'POST /provider-url/create': 'provider-url.create',
    'POST /provider-url/detail': 'provider-url.detail',
    'POST /provider-url/update': 'provider-url.update',
    'POST /provider-url/delete': 'provider-url.delete',

    'GET /settings/fetch': 'settings.fetch',

    'GET /welcome/content': 'welcome.content',

    'GET /service/list': 'service.list',

    'POST /helpdesk/contact': 'helpdesk.contact',
    'POST /user/add-stripe': 'user.add-stripe',
    'POST /user/dobcheck': 'user.dobcheck',

    //ADMIN
    'GET /admin/dashboard/index': 'admin.dashboard.index',

    'POST /admin/provider/pay': 'admin.provider.pay',

    'POST /admin/provider/charges': 'admin.provider.charges',

    'GET /admin/banners/list': 'admin.banners.list',
    'POST /admin/banners/create': 'admin.banners.create',
    'POST /admin/banners/update': 'admin.banners.update',
    'POST /admin/banners/deleted': 'admin.banners.deleted',

    'POST /admin/delivery/create': 'admin.delivery.create',
    'GET /admin/delivery/list': 'admin.delivery.list',
    'GET /admin/delivery/detail': 'admin.delivery.detail',
    'POST /admin/delivery/update': 'admin.delivery.update',

    'GET /admin/my/check': 'admin.my.check',
    'GET /admin/my/detail': 'admin.my.detail',
    'GET /admin/my/profile': 'admin.my.profile',
    'POST /admin/my/login': 'admin.my.login',
    'POST /admin/my/update': 'admin.my.update',
    'POST /admin/my/change-password': 'admin.my.change-password',

    'GET /admin/user/logout': 'admin.user.logout',
    'GET /admin/user/featured-providers': 'admin.user.featured-providers',
    'POST /admin/user/login': 'admin.user.login',
    'POST /admin/user/list': 'admin.user.list',
    'POST /admin/user/detail': 'admin.user.detail',
    'POST /admin/user/make-featured': 'admin.user.make-featured',
    'POST /admin/user/customer-create': 'admin.user.customer-create',
    'POST /admin/user/provider-create': 'admin.user.provider-create',
    'POST /admin/user/subadmin-create': 'admin.user.subadmin-create',
    'POST /admin/user/subadmin-update': 'admin.user.subadmin-update',
    'POST /admin/user/subadmin-assign': 'admin.user.subadmin-assign',
    'POST /admin/user/assign-update': 'admin.user.assign-update',
    'POST  /admin/user/update-address':'admin.user.update-address',

    'GET /admin/category/list': 'admin.category.list',
    'POST /admin/category/view': 'admin.category.view',
    'POST /admin/category/create': 'admin.category.create',
    'POST /admin/category/update': 'admin.category.update',
    'POST /admin/category/restore': 'admin.category.restore',
    'DELETE /admin/category/deleted': 'admin.category.deleted',

    'GET /admin/cities/list': 'admin.cities.list',
    'POST /admin/cities/view': 'admin.cities.view',
    'POST /admin/cities/create': 'admin.cities.create',
    'POST /admin/cities/update': 'admin.cities.update',
    'POST /admin/cities/restore': 'admin.cities.restore',
    'DELETE /admin/cities/deleted': 'admin.cities.deleted',

    'GET /cities/list': 'cities.list',
    'POST /cities/view': 'cities.view',

    'POST /admin/customer/dashboard': 'admin.customer.dashboard',
    'POST /admin/customer/restore': 'admin.customer.restore',
    'POST /admin/customer/update-profile': 'admin.customer.update-profile',
    'DELETE /admin/customer/deleted': 'admin.customer.deleted',

    'POST /admin/address/list': 'admin.address.list',
    'POST /admin/address/status': 'admin.address.status',
    'POST /admin/address/restore': 'admin.address.restore',
    'DELETE /admin/address/deleted': 'admin.address.deleted',

    'GET /admin/promocode/list': 'admin.promocode.list',
    'POST /admin/promocode/view': 'admin.promocode.view',
    'POST /admin/promocode/create': 'admin.promocode.create',
    'POST /admin/promocode/update': 'admin.promocode.update',
    'POST /admin/promocode/restore': 'admin.promocode.restore',
    'DELETE /admin/promocode/deleted': 'admin.promocode.deleted',

    'POST /admin/gallery/list': 'admin.gallery.list',
    'POST /admin/gallery/vlist': 'admin.gallery.vlist',
    'POST /admin/gallery/status': 'admin.gallery.status',
    'POST /admin/gallery/vstatus': 'admin.gallery.vstatus',
    'DELETE /admin/gallery/deleted': 'admin.gallery.deleted',
    'DELETE /admin/gallery/vdeleted': 'admin.gallery.vdeleted',

    'POST /admin/provider/detail': 'admin.provider.detail',
    'POST /admin/provider/timings': 'admin.provider.timings',
    'POST /admin/provider/services': 'admin.provider.services',
    'POST /admin/provider/bookings': 'admin.provider.bookings',
    'POST /admin/provider/addresses': 'admin.provider.addresses',
    'POST /admin/provider/dashboard': 'admin.provider.dashboard',
    'POST /admin/provider/provider-service': 'admin.provider.provider-service',

    'GET /admin/provider/list-docs': 'admin.provider.list-docs',
    'POST /admin/provider/delete-doc': 'admin.provider.delete-doc',
    'GET /admin/provider/download-doc': 'admin.provider.download-doc',

    'POST /admin/provider/gallery': 'admin.provider.gallery',
    'POST /admin/provider/businesshours': 'admin.provider.businesshours',
    'POST /admin/provider/update-profile': 'admin.provider.update-profile',

    'GET /admin/favorite/get': 'admin.favorite.get',
    'POST /admin/favorite/list': 'admin.favorite.list',

    'POST /admin/godsview/list': 'admin.godsview.list',

    'POST /admin/booking/all': 'admin.booking.all',
    'POST /admin/booking/list': 'admin.booking.list',
    'POST /admin/booking/detail': 'admin.booking.detail',
    'DELETE /admin/booking/deleted': 'admin.booking.deleted',

    'POST /admin/transaction/all': 'admin.transaction.all',
    'POST /admin/transaction/list': 'admin.transaction.list',

    'GET /admin/rating/all': 'admin.rating.all',
    'POST /admin/rating/list': 'admin.rating.list',
    'POST /admin/rating/status': 'admin.rating.status',
    'POST /admin/rating/restore': 'admin.rating.restore',
    'DELETE /admin/rating/deleted': 'admin.rating.deleted',

    'POST /admin/settings/list': 'admin.settings.list',
    'POST /admin/settings/update-color': 'admin.settings.update-color',
    'POST /admin/settings/update-basic': 'admin.settings.update-basic',
    'POST /admin/settings/update-website': 'admin.settings.update-website',
    'POST /admin/settings/update-helpdesk': 'admin.settings.update-helpdesk',
    'POST /admin/settings/update-thirdparty':
        'admin.settings.update-thirdparty',
    'POST /admin/settings/update-notifications':
        'admin.settings.update-notifications',

    'GET /admin/service/list': 'admin.service.list',
    'POST /admin/service/view': 'admin.service.view',
    'POST /admin/service/create': 'admin.service.create',
    'POST /admin/service/update': 'admin.service.update',
    'POST /admin/service/restore': 'admin.service.restore',
    'DELETE /admin/service/deleted': 'admin.service.deleted',

    'POST /admin/wallet/list': 'admin.wallet.list',

    'GET /admin/cms/list': 'admin.cms.list',
    'POST /admin/cms/view': 'admin.cms.view',
    'POST /admin/cms/create': 'admin.cms.create',
    'POST /admin/cms/update': 'admin.cms.update',
    'POST /admin/cms/restore': 'admin.cms.restore',
    'DELETE /admin/cms/deleted': 'admin.cms.deleted',

    'GET /admin/admin-settings/list': 'admin.admin-settings.list',
    'POST /admin/admin-settings/update': 'admin.admin-settings.update',

    'GET /admin/helpdesk/get': 'admin.helpdesk.get',
    'POST /admin/helpdesk/view': 'admin.helpdesk.view',
    'POST /admin/helpdesk/reply': 'admin.helpdesk.reply',
    'POST /admin/helpdesk/update': 'admin.helpdesk.update',

    'POST /admin/provider/add-bank': 'admin.provider.add-bank',

    'POST /admin/database/clean': 'admin.database.clean',

    'POST /admin/delivery/add-bank': 'admin.delivery.add-bank',

    //Test
    'POST /test/email': 'test.email'
};
