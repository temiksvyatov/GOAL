const functions = require("firebase-functions");

/**
 * @example
 * const value = requireNotNull(data.value); // in onCall
 * @example
 * const value = requireNotNull(request.body.value); // in onRequest
 * @param{any|null} value nullable value
 * @return{any} value if it not null else throws exception "invalid-argument"
 */
exports.requireNotNull = function(value) {
    if (value != null) return value;

    throw new functions.https.HttpsError(
        "invalid-argument",
        "please do not send us nulls or send not nulls"
    );
};
