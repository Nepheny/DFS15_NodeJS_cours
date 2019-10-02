# DFS15 NodeJS cours

## Projet
Ce projet est une initiation à NodeJS et express avec une base de données mongoDB. Il consiste à realiser la majeure partie des fonctionnalités de [Reddit](https://www.reddit.com/).
Il est réalisé avec Express, un framework Javascript destiné principalement au back.

## Installation
### Prérequis
- [NodeJS v12.10.0](https://nodejs.org/en/download/)
- [postman](https://www.getpostman.com/downloads/)
- [NoSQLBooster for mongoDB](https://nosqlbooster.com/downloads)
- express v4.16.1 : ```sh npm install -g express ```
- expres-generator : ```sh npm install -g express generator```

### Process utilisé
```sh
express --css=sass --view=twig --git
```

## Développement
- Installer le projet
```sh
npm install
```

- lancer le serveur avec nodemon en mode debug
```sh
npm run dev
```

## Routes

| route  | action | url        | options            | return                  |
|--------|:------:|------------|:------------------:| -----------------------:|
| /      | get    | /          |                    | render html posts list  |
| /user  | get    | users/     |                    | render html back-office |
|        | post   | users/     |                    | create user             |
|        | put    | users/     |                    | login                   |
|        | delete | users/     |                    | logout                  |
|        | get    | users/:id  | userId             | read user               |
|        | put    | users/:id  | userId             | update user infos       |
|        | delete | users/:id  | userId             | delete user             |
| /posts | get    | posts/?sub | category           | posts list with filter  |
|        | post   | posts      |                    | create post             |
|        | get    | posts/:id  | postId             | read post with comments |
|        | post   | posts/:id  | postId             | create comment for post |
|        | put    | posts/:id  | postId / commentId | update post / comment   |
|        | delete | posts/:id  | postId             | archieve post           |
