const functions = require("firebase-functions");
const admin = require("firebase-admin");
const common = require("./common");

const {getDreamsByTags, getDetailedDream} = require("./src/dreams/getting");
const {subscribeOnDream} = require("./src/user/activity");
const {registerUser} = require("./src/user/account");

admin.initializeApp();
const db = admin.database();
const auth = admin.auth();

const TEST = true;

exports.register_user = functions.https.onCall((data, _) => {
    const email = common.requireNotNull(data.email);
    const name = common.requireNotNull(data.name);
    const password = common.requireNotNull(data.password);
    const photoURL = data.photoURL;

    return registerUser(email, name, password, photoURL, db, auth);
});

exports.subscribe_on_dream = functions.https.onCall((data, context) => {
    if (!context.auth && !TEST) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can dreaming"
        );
    }

    const userId = common.requireNotNull(data.user_id);
    const dreamId = common.requireNotNull(data.dream_id);

    return subscribeOnDream(userId, dreamId, db);
});

exports.get_dreams_by_tags = functions.https.onCall((data, _) => {
    const tags = common.requireNotNull(data.tags).split(",");

    return getDreamsByTags(tags);
});

exports.get_dream_details = functions.https.onCall((data, context) => {
    if (!context.auth && !TEST) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can dreaming"
        );
    }

    const dreamId = common.requireNotNull(data.dream_id);

    return getDetailedDream(dreamId, db);
});
