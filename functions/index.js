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

exports.get_dreams_by_tags = functions.https.onCall((data, _) => {
    const tags = common.requireNotNull(data.tags).split(",");
    console.log(tags);

    return db.ref("Dreams").get().then((dreams) =>
        dreams.val()
            .filter((dream) =>
                tags.some((tag) => dream.tags.split(",").includes(tag))
            ));
});

exports.get_dream_details = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "only authenticated users can dreaming"
        );
    }

    const dreamId = common.requireNotNull(data.dream_id);

    const dream = db.ref("Dreams").child(dreamId).get()
        .then((dataSnapshot) => dataSnapshot.val());

    const challengesDetails = db.ref("Challenges").get()
        .then((dataSnapshot) => dataSnapshot.val());

    const challengesForDream = db.ref("ChallengesDreams").get()
        .then((challengesDreams) => challengesDreams.val()
            .filter((cd) => cd.dream_id.toString() === dreamId.toString())
            .sort((cd1, cd2) => cd1.challenge_no - cd2.challenge_no)
        );

    const challenges = Promise.all([challengesDetails, challengesForDream])
        .then(([details, indexes]) => indexes.map((index) => {
            const detail = details[index.challenge_id];
            return {
                challenge_id: index.challenge_id,
                challenge_no: index.challenge_no,
                challenge_name: detail.name,
                challenge_description: detail.description,
            };
        }));

    return Promise.allSettled([dream, challenges]).then(([dream, challenges]) => {
        if (dream.status === "rejected" || challenges.status === "rejected") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "there no dream for you",
                {dream: dream.reason, challenges: challenges.reason}
            );
        }
        dream.value.id = dreamId;
        dream.value.challenges = challenges.value;
        return dream.value;
    });
});
