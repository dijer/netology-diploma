const { Advertisement, User } = require('../models');

class AdvertisementModule {
    async find(params) {
        const { shortText, description, userId, tags } = params;
        const findObject = {
            isDeleted: false,
        };
        [shortText, description].forEach(fieldName => {
            if (fieldName) {
                findObject[fieldName] = {
                    $regex: fieldName,
                    $options: 'ig',
                };
            }
        });
        if (tags) {
            findObject.tags = tags;
        }
        if (userId) {
            findObject.userId = userId;
        }
        const advertisements = await Advertisement.find(findObject).populate('userId');
        return advertisements;
    }

    async findById(id) {
        const advertisement = await Advertisement.findById(id);
        return advertisement;
    }

    async create(data) {
        const advertisement = await Advertisement.create(data);
        return advertisement;
    }

    async remove(id) {
        const advertisement = await Advertisement.findByIdAndUpdate(id, {
            isDeleted: true,
        });
        return advertisement;
    }
}

module.exports = new AdvertisementModule();