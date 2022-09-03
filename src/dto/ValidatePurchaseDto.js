const yup = require('yup');

module.exports = yup.object().shape({
    Customer: yup.number().required(),
    ItemID: yup.number().required()
});