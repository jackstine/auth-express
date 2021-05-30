/**
 * 
 * To add apis call addAPI(app, API);
 */

const addAPIs = function (app, listOfAPIs) {
  for (let api of listOfAPIs) {
    addAPI(app, api)
  }
};

/* 
  TODO change the layout of the APIs
  dont change the code below this is for setting up the APIs for the server
  each API is a object of  the following
  {
    gets:
    posts:
    puts:
    deletes:
  }
  of which contain a list of these objects
  {
    middleware: the middleware function
    route: the route for the API
    func: the function to call at this route
  }
*/
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
