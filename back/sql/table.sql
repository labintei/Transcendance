-- SQLite

CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    username    VARCHAR(30) NOT NULL UNIQUE,
    ft_pseudo   VARCHAR(8) NOT NULL UNIQUE,
    mdp         VARCHAR(30) NOT NULL,     
    avatar_loc  VARCHAR(260) ,
    connect     bool,
    rank        int
);
/*
INSERT INTO users (username, ft_pseudo, mdp, avatar_loc, connect, rank)
VALUES ('lyo', 'dye', 'weyfe', 'deye', true, 1);

INSERT INTO users (username, ft_pseudo, mdp, avatar_loc, connect, rank)
VALUES ('ennemi', 'hate', 'you', 'stupid', true, 1);*/

-- AFFICHAGE USER 1
/*
SELECT users.username , users.avatar_loc , users.connect
FROM users
WHERE users.id == 1;*/
-- AFFICHAGE profil (j aurais besoin de match hystory)

CREATE TABLE IF NOT EXISTS match_hystory (
    win_id      INTEGER,
    win_score   INTEGER,
    los_id      INTEGER,
    los_score   INTEGER,
    rank_up     BOOL,
    time        DATE,
    FOREIGN KEY (win_id) REFERENCES users(id),
    FOREIGN KEY (los_id) REFERENCES users(id)
);


/*peut etre devoir ajouter CONSTRAINT*/

-- AFFICHAGE DE victoire comptes et defaites 

/*
INSERT INTO match_hystory (win_id, los_id, win_score, los_score, rank_up, time)
VALUES (1, 2, 6 , 3 , false, CURRENT_DATE);
INSERT INTO match_hystory (win_id, los_id, win_score, los_score, rank_up, time)
VALUES (1, 2, 33 , 2 , false, CURRENT_DATE);
INSERT INTO match_hystory (win_id, los_id, win_score, los_score, rank_up, time)
VALUES (2, 1, 33 , 2 , false, CURRENT_DATE);*/


-- Compter les victoires de tout le monde
/*
SELECT COUNT(id) as nb_victoire , m.win_id
FROM match_hystory m
LEFT JOIN users u ON u.id = win_id
GROUP BY u.id;
*/
-- Compter les defaites de tout le monde
/*
SELECT COUNT(id) as nb_defeat , m.los_id
FROM match_hystory m
LEFT JOIN users u ON u.id = los_id
GROUP BY u.id;*/

-- Ne DETERMINE PAS ENCORE TRES BIEN L UTILITEE de GROUP

-- Compter les victoires de 1
/*
SELECT COUNT(id) as nb_victoire , m.win_id
FROM match_hystory m
LEFT JOIN users u ON u.id = win_id
GROUP BY u.id
HAVING win_id == 1;
*/
-- Compter les defaites de 1
/*
SELECT COUNT(id) as nb_defeat , M.los_id
FROM match_hystory m
LEFT JOIN users u ON u.id = los_id
GROUP BY u.id
HAVING los_id == 1;*/

-- Montrer les match hystory de 1

/*
SELECT *
FROM match_hystory ma
LEFT JOIN users u ON u.id = ma.los_id AND u.id = ma.win_id
WHERE ma.win_id = 1 OR ma.los_id = 1;*/

/*
SELECT COUNT(id) as count, rank
FROM users
GROUP BY rank
HAVING count == 1;
*/


-- AFFICHAGE DE MATCH HISTORY

/*
INSERT INTO match_hystory (win_id, los_id, win_score, los_score, rank_up, time)
VALUES (1, 2, 4 , 2 , false, CURRENT_DATE);*/

CREATE TABLE IF NOT EXISTS friend (
    user_id      INTEGER,
    friend_id    INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, friend_id) 
);
/*
INSERT INTO  friend (user_id, friend_id)
VALUES (1 , 2);
*/
CREATE TABLE IF NOT EXISTS block (
    user_id     INTEGER,
    block_id   INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (block_id) REFERENCES users (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, block_id)
);
/*
INSERT INTO block (user_id, block_id)
VALUES (1, 3);
*/
CREATE TABLE IF NOT EXISTS invitation (
    user_id     INTEGER,
    request_id  INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES users (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, request_id)    
);
/*
INSERT INTO invitation (user_id, request_id)
VALUES (3, 1);
*/
CREATE TABLE IF NOT EXISTS invitation_chat (
    user_id     INTEGER,
    chat_id     INTEGER,
    status      CHAR,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (chat_id) REFERENCES chat (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, chat_id) 
);
/*
INSERT INTO invitation_chat (user_id, chat_id)
VALUES (2, 1);
*/
CREATE TABLE IF NOT EXISTS chat_block (
    user_id    INTEGER,
    chat_id    INTEGER,    
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (chat_id) REFERENCES chat (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, chat_id)
);
/*
INSERT INTO chat_block (user_id, chat_id)
VALUES (3 , 1);
*/
CREATE TABLE IF NOT EXISTS chat (
    id              INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name            VARCHAR(30) NOT NULL UNIQUE,
    owner_id        INTEGER,
    status          CHAR,
    FOREIGN KEY (owner_id) REFERENCES users (id)
);
/*
INSERT INTO chat (name , owner_id, status)
VALUES ('hiii', 1, 'u');
*/
CREATE TABLE IF NOT EXISTS connect (
    user_id    INTEGER,
    chat_id    INTEGER,
    status     CHAR,    
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (chat_id) REFERENCES chat (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, chat_id)
);
/*
INSERT INTO connect (user_id, chat_id , status)
VALUES (1, 1, 'o');
*/





