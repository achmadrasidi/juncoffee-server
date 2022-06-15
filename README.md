<p align="center">

  <h1 align="center">Juncoffee Server</h1>
  <p align="center">
    <image align="center" width="100" src='../frontend/static/assets/img/coffee 1.png' />
  </p>

  <p align="center">
    <br />
    <a href="https://juncoffe.netlify.app/">View Demo</a>
    ·
    <a href="https://github.com/achmadrasidi/juncoffee/issues">Report Bug</a>
    ·
    <a href="https://github.com/achmadrasidi/juncoffee/issues">Request Feature</a>
  </p>
</p>

## Table of Contents

- [About the Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Related Project](#related-project)

## About The Project

Coffee Shop is a store that sells some good meals, and especially coffee. We provide high quality beans.

### Built With

[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
<br>

## Getting Started

### Prerequisites

- [NodeJs](https://nodejs.org/)
- [PostgreSql](https://www.postgresql.org/)
- [Postman](https://www.postman.com/)

### Installation

1. Clone the repo

```sh
git clone https://github.com/achmadrasidi/juncoffee.git
```

2. Go to _server_ directory

```sh
cd server
```

3. Install NPM packages

```sh
npm install
```

4. Add .env file at root folder project, and add following

```sh
PORT
DB_USER
DB_HOST
DB_DATABASE
DB_PORT
DB_PASS
JWT_SECRET_KEY
JWT_ISSUER
```

5. Starting application

```sh
npm run startDev
```

### Related Project

- [`Frontend-coffeshop`](https://github.com/achmadrasidi/juncoffee/tree/main/frontend)
- [`Backend-coffeshop`](https://github.com/achmadrasidi/juncoffee/tree/main/server)
