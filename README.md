# Auth-Express

Do you need a pre-set of APIs that handle authentication and user creation? Then Auth Express is your API authentication tool. Just Fork it and run `yarn dev-server` or `npm run dev-server`. This is a pre-setup Box full of authentication, token, and user APIS.

This package is currently set up with postgres using `pg`.

## Setup

### Config
`dotenv` is installed, so create a `.env` file with the environment veariables for pg AUTH_HOST,AUTH_DATABASE, AUTH_USER, AUTH_PASSWORD. Update the `src/config/config.dev.js` for other non-secret configs.

### SQL
Use the `sql/createTables.sql` if you plan to create the postgres tables.

## APIs Exposed

- **POST/auth/token/verify** - just to verify the token sent in the `authentication` header

- **POST/auth/login** - requires `user_id` and `password`
- **GET/user/email** - requires `user_id`, return true or false if the email  already exists or not.
- **GET/user**/:user - requires `user_id` returns the user data
- **POST/user** - create user must have `user_id`
- **PUT/user** - update user must have `user_id`
- **POST/user/verify**- verify the user after the user has been created, IE.  send an email with a link to your site, and call this from your site.
- **POST/user/password/forgot** - requires `user_id`, calls this if your users have forgotten their password, then send them an email
- **POST/user/password/forgot/reset** - requires `user_id` and `tempPassword` `newPassword`
- **POST/user** - create a user, requires `user_id` and `password`

## Routes
All routes that require authentication, this is set by default, will set the properties `__authenticationToken` and `__authentication` inside the request object in express.

`APIs.js` set up the routes, using this structure below.  Add routes in `server.js`.

```javascript
const UserRoutes = {
  extension: 'user',
  gets: [
    {func: hasEmailForUser, route: 'email', auth: false}, // points to /user/email
    {func: getUser, route: ':user'} // points to /user/:user
  ],
  posts: [
    {func: createUser, route: "", auth: false}, // user
    {func: verifyUser, route: "verify", auth: false}, // user/verify
    {func: forgotPassword, route: "password/forgot", auth: false}, // user/password/forgot
    {func: resetWithTempPassword, route: "password/forgot/reset", auth: false} // user/password/forgot/reset
  ],
  puts: [
    {func: updateUser, route: ""}
  ]
}
```

## Schemas

### User
currently the user is made up of the following attributes
```javascript
{
  "id" :  // id generated in the backend
  "fist_name" :
  "last_name" :
  "user_id" : // id of the user, usually the email
  "email" :   // email
  "username" : // if you want a username for them
  "phone" :   // phone
  "verified" :  // if the user has been verified, look at POST:verify API
  "created_date" : // date created
}
```
