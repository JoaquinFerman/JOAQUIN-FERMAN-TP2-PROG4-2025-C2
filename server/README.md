<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## MongoDB Atlas setup (project-specific notes)

This project reads the MongoDB connection URI from the environment variable `MONGODB_URI` via `ConfigModule.forRoot()`.

Quick checklist to connect to Atlas:

- Create a Cluster on MongoDB Atlas (free tier is fine for development).
- Create a database user (Database Access) and note the username/password.
- Add your current IP to Network Access (or use 0.0.0.0/0 only for quick testing).
- Copy the "Connection String (SRV)" from Atlas and replace `<username>`, `<password>` and `<dbname>`.
- Store the URI in `server/.env` as `MONGODB_URI="mongodb+srv://..."` (do NOT commit `.env` to Git).

Example `.env` entry (already provided as `.env.example`):

MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcdef.mongodb.net/redsocial?retryWrites=true&w=majority"

Test connection locally with `mongosh`:

```bash
mongosh "mongodb+srv://<username>:<password>@cluster0.abcdef.mongodb.net/redsocial"
use redsocial
db.usuarios.findOne()
db.usuarios.getIndexes()
```

If you need to migrate local data to Atlas, use `mongodump`/`mongorestore`:

```bash
# create a dump from local
mongodump --uri="mongodb://localhost:27017/redsocial" --archive=redsocial.archive.gz --gzip

# restore into Atlas
mongorestore --uri="${MONGODB_URI}" --archive=redsocial.archive.gz --gzip --nsFrom="redsocial.*" --nsTo="redsocial.*"
```

## Supabase storage setup (profile and publication images)

This project uses Supabase Storage to store user profile images (bucket `usuarios`) and publication images (bucket `publicaciones`). The server expects two environment variables set before start:

- `SUPABASE_URL` — your Supabase project URL (e.g. `https://abcd1234.supabase.co`)
- `SUPABASE_KEY` — a Supabase API key (use the service_role key for server-side uploads or a restricted key if you prefer)

Note: do NOT attempt to wire Supabase Auth as your application's main authentication in this project. Auth here is handled with your JWT/NestJS pipeline. The Supabase client is used only for Storage (file uploads). On the server you should use a server-side key (service_role) and avoid client-side auth/session code.

Add them to your `server/.env` (or your environment) like this:

```bash
# Example (DO NOT COMMIT):
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_KEY="your-service-or-anon-key"
```

Create the storage buckets in the Supabase dashboard:

- Bucket name: `usuarios` — used for profile images.
- Bucket name: `publicaciones` — used for publication images.

Permissions: For quick testing you can make the buckets public (or enable public access for uploaded objects). For production, prefer private buckets and generate signed URLs when serving images.

Endpoints the server exposes (after adding the env vars and starting the server):

- `POST /auth/upload-image` — form-data `file` field; uploads to `usuarios` and returns `{ imagenUrl, filename }`.
- `POST /publicaciones/:id/upload-image` — form-data `file` field; uploads to `publicaciones/:id/<filename>` and returns `{ imagenUrl, filename }`.

After adding the environment variables, restart the server from the `server/` folder:

```bash
cd /home/lockdown/Desktop/UTN/Progra_4/tp_integrador2/server
npm run start
```


After creating `server/.env`, restart the backend from the `server` folder:

```bash
cd /home/lockdown/Desktop/UTN/Progra_4/tp_integrador2/server
npm run start
```

Security notes:
- Never commit `.env` to git. Use `.env.example` as a template.
- Use IP whitelist and least-privilege DB users in production.
- Consider rotating credentials if shared publicly.

