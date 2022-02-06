const functions = require("firebase-functions");
const admin = require("firebase-admin");
const common = require("./common");

admin.initializeApp();
const db = admin.database();
const auth = admin.auth();

exports.register_user = functions.https.onCall((data, _) => {
    const user = {
        email: common.requireNotNull(data.email),
        name: common.requireNotNull(data.name),
        password: common.requireNotNull(data.password),
        photoURL: data.photoURL,
    };

    return auth.createUser({
        email: user.email,
        displayName: user.name,
        password: user.password,
    }).then((record) => {
        db.ref("Users").child(record.uid).set({
            name: user.name,
            photoURL: user.photoURL,
        }).catch((reason) => {
            console.log(reason);
            return {code: 403, reason: "problem with authentication"};
        });

        return {status: "ok"};
    }).catch((reason) => {
        console.log(reason);
        return {code: 403, reason: "problem with authentication"};
    });
});

exports.subscribe_on_dream = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can dreaming"
        );
    }

    const userDream = {
        user_id: common.requireNotNull(data.user_id),
        dream_id: common.requireNotNull(data.dream_id),
    };

    db.ref("UsersDreams").push(userDream);
    return {status: "ok"};
});
