const yup = require('yup');

module.exports = yup.object().shape({
    CustomerNumber: yup.number().required(),
    ItemID: yup.number().required()
});