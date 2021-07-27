let KommonitorHarvesterApi = require('kommonitorHarvesterApi');

exports.makeErrorObject = function (customMessage, error) {
    let errorOccurred = new KommonitorHarvesterApi.SummaryTypeErrorsOccurred();

    errorOccurred.message = customMessage + " - " + error.message;
    if (error.response) {
        errorOccurred.code = error.response.status || 500;

        if (error.response.data && error.response.data.error_description) {
            errorOccurred.message += " - " + error.response.data.error_description;
        }
        else if (error.response.data && error.response.data.message) {
            errorOccurred.message += " - " + error.response.data.message;
        }
    }

    return errorOccurred;
};