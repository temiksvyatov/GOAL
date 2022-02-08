const functions = require("firebase-functions");

// noinspection JSValidateTypes
/**
 * @param {Array<string>} tags
 * @param {Database} db
 * @return {Promise<Dream>} Dream
 */
exports.getDreamsByTags = (tags, db) => db.ref("Dreams").get()
    .then((dreams) =>
        dreams.val()
            .filter((dream) =>
                tags.some((tag) => dream.tags.split(",").includes(tag))
            )
    );

/**
 * @param {string} dreamId
 * @param {Database} db
 * @return {Promise<DetailedDream>} detailed dream
 */
exports.getDetailedDream = (dreamId, db) => {
    const dream = db.ref("Dreams").child(dreamId).get()
        .then((dataSnapshot) => {
            const dream = dataSnapshot.val();
            dream.tags = dream.tags.split(",");

            return dream;
        });

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
                id: index.challenge_id,
                no: index.challenge_no,
                name: detail.name,
                description: detail.description,
            };
        }));

    return Promise.allSettled([dream, challenges])
        .then(([dream, challenges]) => {
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
};
