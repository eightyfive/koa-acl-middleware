

module.exports = function factory(acl, getUser) {
  return function(numPathComponents, userId, actions) {
    return function* (next) {
      var ctx = this;
      var _numPathComponents = numPathComponents || this.request.path.split('/').length;
      var _actions = actions || this.request.method.toLowerCase();
      var _userId = userId;
      var _expressMiddleware;

      if (typeof _userId === 'function') {
        _userId = _userId(ctx);
      }
      if (!_userId && getUser) {
        _userId = getUser(ctx);
      }

      _expressMiddleware = acl.middleware.call(acl, _numPathComponents, _userId, _actions);

      try {
        yield new Promise(function(resolve, reject) {
          _expressMiddleware(ctx.request, ctx.response, function(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      } catch (err) {
        ctx.throw(err.errorCode, err.msg);
      }

      yield next;
    }
  }
};
