/**
 * @param {string} email
 * @param {string} name
 * @param {string} password
 * @param {string} photoURL
 * @param {Database} db
 * @param {Auth} auth
 * @return {Promise<{status: string}|{code: number, reason: string}>}
 */
exports.registerUser = (email, name, password, photoURL, db, auth) => auth.createUser({
    email: email,
    displayName: name,
    password: password,
})
    .then((record) => {
        db.ref("Users").child(record.uid).set({
            name: name,
            photoURL: photoURL,
        }).catch((reason) => {
            console.log(reason);
            return {code: 403, reason: "problem with authentication"};
        });

        return {status: "ok"};
    }).catch((reason) => {
        console.log(reason);
        return {code: 403, reason: "problem with authentication"};
    });
