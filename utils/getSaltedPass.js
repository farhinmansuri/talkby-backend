const bcrypt = require('bcrypt');
const getSaltedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}
module.exports = { getSaltedPassword };