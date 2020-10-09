const addAddOn = async (groupId, addOns) => {
    if (addOns && addOns.length > 0) {
        for (const x in addOns) {
            var costPriceAddon = addOns[x].price;
            if (
                addOns[x].costPrice &&
                typeof addOns[x].costPrice != 'undefined' &&
                addOns[x].costPrice != ''
            ) {
                costPriceAddon = addOns[x].costPrice;
            }
            await ProviderServiceAddon.create({
                name: addOns[x].name,
                provider_service_group_id: groupId,
                price: addOns[x].price,
                cost_price: costPriceAddon,
                description: addOns[x].description,
                created_by: createdBy
            });
        }
    }
};

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var serviceId = req.param('serviceId');
    const price = req.param('price');
    const costPrice = req.param('costPrice');
    const addOnGroup =
        req.param('addOnGroup') && req.param('addOnGroup') != ''
            ? JSON.parse(req.param('addOnGroup'))
            : [];
    const categoryId = req.param('categoryId');
    const addressIds = req.param('addressIds');
    const description = req.param('description');
    const serviceName = req.param('serviceName');
    const createdBy = req.authUser.id;
    var file = req.file('file');
    
    if (
        typeof categoryId == 'undefined' ||
        typeof addressIds == 'undefined' ||
        typeof description == 'undefined' ||
        typeof price == 'undefined' ||
        typeof costPrice == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    if (Number(price) > Number(costPrice)) {
        response.message = sails.__(
            'Cost price must be greator than selling price'
        );
        return res.send(response);
    }

    if (typeof serviceName != 'undefined' && typeof serviceId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (
            serviceName &&
            serviceName != '' &&
            typeof serviceName != 'undefined'
        ) {
            let admins = [];
            var adminModel = await User.find({
                role: sails.config.constants.ROLE_ADMIN
            }).select('id');
            if (adminModel && adminModel.length > 0) {
                for (x in adminModel) {
                    admins.push(adminModel[x].id);
                }
            }
            admins.push(createdBy);
            const oldServiceWithName = await Service.find({
                name: serviceName,
                created_by: admins
            }).limit(1);
            if (oldServiceWithName.length > 0) {
                response.message = sails.__('You already provide this service');
                return res.json(response);
            }
            const slug = await Service.getSlug(serviceName);
            await Service.create({
                name: serviceName,
                slug: slug,
                category_id: categoryId,
                status: sails.config.constants.STATUS_ACTIVE,
                created_by: createdBy,
                description: description
            });
            const newService = await Service.find({
                slug: slug,
                created_by: createdBy
            }).limit(1);
            if (newService && newService.length > 0) {
                serviceId = newService[0].id;
            }
        }
        if (serviceId) {
            let fileName = null;
            if (typeof file != 'undefined') {
                fileName = await Api.uploadFileImage(file, '/service');
            }
            await ProviderService.create({
                service_id: serviceId,
                category_id: categoryId,
                address_ids: addressIds,
                price: price,
                cost_price: costPrice,
                created_by: createdBy,
                description: description,
                image: fileName
            });
            var createdService = await ProviderService.find({
                service_id: serviceId,
                category_id: categoryId,
                price: price,
                cost_price: costPrice,
                created_by: createdBy
            })
                .sort([{ created_at: 'DESC' }])
                .limit(1);
            if (createdService.length > 0) {
                await RatingLog.intialCreate(createdBy);
                if (addOnGroup && addOnGroup.length > 0) {
                    for (var key in addOnGroup) {
                        var existing = await ProviderServiceAddonGroup.find({
                            name: addOnGroup[key].name,
                            provider_service_id: createdService[0].id,
                            created_by: createdBy
                        }).limit(1);
                        if (existing && existing.length > 0) {
                            await addAddOn(
                                existing[0].id,
                                addOnGroup[key].addOns
                            );
                        } else {
                            await ProviderServiceAddonGroup.create({
                                name: addOnGroup[key].name,
                                quantity: addOnGroup[key].quantity,
                                required: addOnGroup[key].required,
                                provider_service_id: createdService[0].id,
                                description: addOnGroup[key].description,
                                created_by: createdBy
                            });
                        }
                        existing = await ProviderServiceAddonGroup.find({
                            name: addOnGroup[key].name,
                            provider_service_id: createdService[0].id,
                            created_by: createdBy
                        }).limit(1);
                        if (existing && existing.length > 0) {
                            await addAddOn(
                                existing[0].id,
                                addOnGroup[key].addOns
                            );
                        }
                    }
                }
                response.status = 'OK';
                response.message = sails.__('Service created successfully');
                response.data.service = {
                    key: serviceId,
                    createdService: createdService[0].id
                };
                response.data.message = sails.__(
                    'Service created successfully'
                );
                return res.json(response);
            } else {
                response.status = 'NOK';
                response.message = sails.__('Unable to create service');
                return res.json(response);
            }
        } else {
            response.message = sails.__('Invalid data');
            return res.json(response);
        }
    } catch (err) {
       
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
