const yup = require('yup');

module.exports = yup.object().shape({
    CustomerID: yup.number().required()
});