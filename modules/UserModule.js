const { User } = require('../models');

class UserModule {
    async create(data) {
        const user = new User(data)
        await user.save();
        return user;
    }

    async findByEmail(email) {
        const user = await User.findOne({ email });
        return user;
    }

    async findById(id) {
        const user = await User.findById(id);
        return user;
    }
}

module.exports = new UserModule();