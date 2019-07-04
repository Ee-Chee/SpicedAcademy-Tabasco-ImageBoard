//create connection pooling, to handle sudden burst of traffic
var spicedPg = require("spiced-pg");
//postges:username:password@port/database
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/lengstylegram"
);

exports.addImage = function(url, userN, tit, des) {
    let q = `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *;`;
    let params = [url, userN, tit, des];
    return db.query(q, params);
};

exports.getImages = function() {
    let q = `SELECT * FROM images ORDER BY id DESC LIMIT 6;`;
    return db.query(q);
};

exports.getImage = function(id) {
    let q = `SELECT * FROM images WHERE id = $1;`;
    let params = [id];
    return db.query(q, params);
};

exports.addComment = function(com, user, id) {
    let q = `INSERT INTO comments (comment, userN, img_id) VALUES ($1, $2, $3) RETURNING *;`;
    let params = [com, user, id];
    return db.query(q, params);
};

exports.getComments = function(id) {
    let q = `SELECT * FROM comments WHERE img_id = $1 ORDER BY id DESC;`;
    let params = [id];
    return db.query(q, params);
};

exports.getMoreImages = function(lastID) {
    //of course you can use promise all to execute two queries. The following method is a cooler way.
    //SELECT id FROM images ORDER BY id ASC LIMIT 1 -> To find the very last id of image in database
    let q = `SELECT *, (
    SELECT id FROM images
    ORDER BY id ASC
    LIMIT 1
    ) AS lowest_id FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 4;`;
    let params = [lastID];
    return db.query(q, params);
};
