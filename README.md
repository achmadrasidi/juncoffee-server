<p align="center">

  <h1 align="center">Juncoffee Server</h1>
  <p align="center">
    <image align="center" width="100" src='./static/assets/img/coffee 1.png' />
  </p>

  <p align="center">
    <br />
    <a href="https://juncoffe.netlify.app/">View Live Application</a>
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

Juncoffee is a store that sells some good meals, and especially coffee. We provide high quality beans.

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
$ git clone https://github.com/achmadrasidi/juncoffee-server.git
```

2. Install NPM packages

```sh
$ npm install
```

3. Add .env file at root folder project, and add following

```sh
PORT=*YOUR PORT*
DB_USER=*YOUR DB_USER*
DB_HOST=*YOUR DB_HOST*
DB_DATABASE=*YOUR DB_DATABASE*
DB_PORT=*YOUR DB_PORT*
DB_PASS=*YOUR DB_PASS*
REDIS_CLIENT_URL=*YOUR REDIS_CLIENT_URL*
JWT_SECRET_KEY=*YOUR JWT_SECRET_KEY*
JWT_ISSUER=*YOUR JWT_ISSUER*
JWT_SECRET_CONFIRM_KEY=*YOUR JWT_SECRET_CONFIRM_KEY*
JWT_SECRET_PAYMENT_KEY=*YOUR JWT_SECRET_PAYMENT_KEY*
JWT_SECRET_PASSWORD_KEY=*YOUR JWT_SECRET_PASSWORD_KEY*
MAIL_USERNAME=*YOUR MAIL_USERNAME*
MAIL_PASSWORD=*YOUR MAIL_PASSWORD*
OAUTH_CLIENTID=*YOUR OAUTH_CLIENTID*
OAUTH_CLIENT_SECRET=*YOUR OAUTH_CLIENT_SECRET*
OAUTH_REFRESH_TOKEN=*YOUR OAUTH_REFRESH_TOKEN*
CLIENT_URL=*YOUR CLIENT_URL*
```

4. This app using cloudinary as a file storage

```sh
CLOUDINARY_URL=cloudinary://564544498788315:ZK3Nfw_bTfpxxNyQ3FheeQF-VmU@dyo0qolq4
```

5. Starting application

```sh
npm run startDev
```

6. Juncoffee Server App is Running

### Related Project

- [`Frontend-juncoffee`](https://github.com/achmadrasidi/juncoffee-client)
- [`Backend-juncoffee`](https://github.com/achmadrasidi/juncoffee-server)
