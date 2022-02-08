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
