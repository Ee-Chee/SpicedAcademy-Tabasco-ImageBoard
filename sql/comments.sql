DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment VARCHAR(500) NOT NULL CHECK (comment!=''),
    userN VARCHAR(25) NOT NULL CHECK (userN!=''),
    img_id INTEGER REFERENCES images(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
