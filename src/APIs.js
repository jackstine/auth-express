const authPg = require('@nodeauth/auth-pg')

const authenticateAPI = async function (req, res, next) {
  let authToken = req.get('authorization')
  if (authToken) {
    let authResp = await authPg.auth.token.authenticateToken(authToken)
    if (authResp.success) {
      req.__authenticationToken = req.get('authorization')
      req.__authentication = authResp
      console.log('ACCESS')
      next()
    } else {
      console.log('No ACCESS')
      res.status(401, 'Unauthorized')
    }
  } else {
    console.log('No ACCESS')
    res.status(401, 'Unauthorized')
  }
}

/**
 * 
 * To add apis call addAPI(app, API);
 */

const addAPIs = function (app, listOfAPIs) {
  for (let api of listOfAPIs) {
    addAPI(app, api)
  }
};

const addAPI = function(app, apis) {
  if (!Array.isArray(apis)) {
    apis = [apis];
  }
  for(let api of apis) {
    let extention = `/${api.extension}`;
    //gets come in to the req.query
    addExtensions(extention, api.gets, app.get.bind(app), api.middleware);
    addExtensions(extention, api.posts, app.post.bind(app), api.middleware);
    addExtensions(extention, api.puts, app.put.bind(app), api.middleware);
    addExtensions(extention, api.deletes, app.delete.bind(app), api.middleware);
  }
 }
 
 function addExtensions(extention, apis, app, middleware) {
  if (apis) {
    apis.forEach(function(api) {
      let route = extention
      if (api.route && api.route !== '') {
        route = route + `/${api.route}`
      }
      if (!(api.auth === false)) {
        app(route, authenticateAPI)
      }
      if (middleware) {
        app(route, middleware);
      }
      console.log(route)
      app(route, (req, res, next) => {
        // if the function is not a async function, promise
        // then add a try catch
        api.func(req, res, next).catch(err => {
          console.error(err)
          res.status(500)
          res.send('ERROR')
        })
      });
    });
  }
}


module.exports = addAPIs
