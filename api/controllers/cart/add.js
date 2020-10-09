const checkAddress = async (
    authUser,
    provider_id,
    customerAddressId,
    delivery_type,
    delivery_note,
    promo_code,
    cart = null
) => {
    var addressPacket = await UserAddress.fetchNearestAddress(
        authUser,
        provider_id,
        customerAddressId
    );
 
    if (
        addressPacket &&
        addressPacket.customerAddressId != undefined &&
        addressPacket.providerAddressId != undefined
    ) {
        if (addressPacket.status == 'OK') {
            if (cart != null) {
                await Cart.update({
                    id: cart.id,
                }).set({
                    items: [],
                    provider_id: provider_id,
                    provider_address_id: addressPacket.providerAddressId,
                    customer_address_id: addressPacket.customerAddressId,
                    delivery_type: delivery_type,
                    created_by: authUser.id,
                    delivery_note: delivery_note,
                    promo_id: promo_code,
                });
            } else {
                await Cart.create({
                    items: [],
                    provider_id: provider_id,
                    provider_address_id: addressPacket.providerAddressId,
                    customer_address_id: addressPacket.customerAddressId,
                    delivery_type: delivery_type,
                    created_by: authUser.id,
                    delivery_note: delivery_note,
                    promo_id: promo_code,
                });
            }
            return { status: 'OK' };
        } else {
            return { status: 'NOK', message: addressPacket.message };
        }
    } else {
        return { status: 'NOK', message: addressPacket.message };
    }
};

module.exports = async function add(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedUser = req.authUser;
    const provider_id = req.param('providerId');
    const concent =
        typeof req.param('concent') == 'undefined'
            ? false
            : req.param('concent');
    const cartItem = req.param('cartItem');
    const delivery_note = req.param('deliveryNote');
    let delivery_type = req.delivery_type;
    if (typeof req.delivery_type == 'undefined') {
        delivery_type = sails.config.constants.DELIVERY_TYPE_DELIVERY;
    }

    const promo_code = req.param('promoCode');
    let customerAddressId = req.param('customerAddressId') || null;

    if (
        typeof provider_id == 'undefined' ||
        typeof cartItem == 'undefined' ||
        typeof delivery_type == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var cartExist = await Cart.find({
            created_by: loggedUser.id,
        }).limit(1);
        let message = {
            status: 'NOK',
            message: sails.__("This restaurant doesn't deliver to your area"),
        };
        if (cartExist && cartExist.length > 0) {
            message = await checkAddress(
                req.authUser,
                provider_id,
                customerAddressId,
                delivery_type,
                delivery_note,
                promo_code,
                cartExist[0]
            );
           
            if (message.status == 'NOK') {
                response.message = message.message;
                return res.send(response);
            }
        } else {
            message = await checkAddress(
                req.authUser,
                provider_id,
                customerAddressId,
                delivery_type,
                delivery_note,
                promo_code
            );
            if (message.status == 'NOK') {
                response.message = message.message;
                return res.send(response);
            }
            cartExist = await Cart.find({
                created_by: loggedUser.id,
            }).limit(1);
         
        }
        if (
            customerAddressId == null ||
            typeof customerAddressId == 'undefined'
        ) {
            customerAddressId = cartExist[0].customer_address_id;
        }

        if (concent) {
            
            const verify = await Cart.verifyItem(
                cartItem,
                provider_id,
                cartExist[0].provider_address_id
            );
            if (verify.status == true) {
                await Cart.update({
                    created_by: loggedUser.id,
                }).set({
                    items: [cartItem],
                    provider_id: provider_id,
                    delivery_note: delivery_note,
                    promo_id: promo_code,
                });
                response.status = 'OK';
                response.message = sails.__('Item added to cart succussfully');
                return res.send(response);
            }
            if (verify.status == false) {
                response.message = sails.__(verify.message);
                return res.send(response);
            }
            response.message = sails.__('Invalid item');
            return res.send(response);
        } else {
            
            const verify = await Cart.verifyItem(
                cartItem,
                provider_id,
                cartExist[0].provider_address_id
            );
            if (verify.status == true) {
                if (
                    cartExist[0].provider_id != null &&
                    cartExist[0].provider_id != provider_id
                ) {
                    await Cart.update({
                        created_by: loggedUser.id,
                    }).set({
                        items: [],
                        provider_id: null,
                        provider_address_id: null,
                    });
                }
                var promoCodeModel = null;
                if (typeof promoCode != 'undefined' && promoCode != '') {
                    promoCodeModel = await PromoCodes.find({
                        code: promoCode.code,
                        status: sails.config.constants.STATUS_ACTIVE,
                    })
                        .sort('created_at DESC')
                        .limit(1);
                    if (promoCodeModel && promoCodeModel.length > 0) {
                        var check = await PromoCodes.checkEligibility(
                            loggedUser,
                            promoCodeModel[0]
                        );
                        if (check.status != 'OK') {
                            response.message = check.message;
                            return res.send(response);
                        }
                    }
                }
                let existingItems = cartExist[0].items;
                let addNew = true;
                for (const x in existingItems) {
                    if (existingItems[x].itemId === cartItem.itemId) {
                        if (
                            existingItems[x].addOns &&
                            existingItems[x].addOns.length === 0 &&
                            cartItem.addOns.length === 0
                        ) {
                            existingItems[x].quantity =
                                existingItems[x].quantity + cartItem.quantity;
                            addNew = false;
                            break;
                        } else if (
                            existingItems[x].addOns &&
                            existingItems[x].addOns === cartItem.addOns
                        ) {
                            existingItems[x].quantity =
                                existingItems[x].quantity + cartItem.quantity;
                            addNew = false;
                            break;
                        }
                    }
                }
                if (addNew) {
                    existingItems.push(cartItem);
                }
                await Cart.update({
                    created_by: loggedUser.id,
                }).set({
                    items: existingItems,
                    provider_id: provider_id,
                    delivery_note: delivery_note,
                    promo_id: promo_code,
                });
                response.status = 'OK';
                response.message = sails.__('Item added to cart succussfully');
                return res.send(response);
            }
            if (verify.status == false) {
                response.message = sails.__(verify.message);
                return res.send(response);
            }
            
            response.message = sails.__('Invalid item');
            return res.send(response);
        }
    } catch (err) {
       
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
