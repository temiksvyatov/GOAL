/**
 * @param {string} userId
 * @param {string} dreamId
 * @param {database.Database} db
 * @return {{status: String}}
 */
exports.subscribeOnDream = (userId, dreamId, db) => {
    const userDream = {
        user_id: userId,
        dream_id: dreamId,
    };
    db.ref("UsersDreams").push(userDream);
    return {status: "ok"};
};

/**
 * @param {string} userId
 * @param {database.Database} db
 * @return {Promise<Array<DreamSubscription>>}
 */
exports.getUserSubscriptions = (userId, db) => db.ref("UsersDreams").get()
    .then((usersDreams) =>
        Object.values(usersDreams.val()).filter((userDream) => {
            console.log(userId);
            console.log(userDream.user_id);
            return userDream.user_id === userId;
        })
    );

/**
 * @param {string} userId
 * @param {database.Database} db
 * @return {Promise<UserDetails>}, characteristics - dictionary<string: number>
 */
exports.getUserDetails = (userId, db) => db.ref("Users").child(userId).get()
    .then((userSnapshot) => {
        const user = userSnapshot.val();
        user.user_id = userId;

        return user;
    });
