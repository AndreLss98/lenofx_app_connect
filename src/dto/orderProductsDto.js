const yup = require('yup');

module.exports = yup.object().shape({
    OrderNumber: yup.number().required(),
    Customer: yup.number().required()
});