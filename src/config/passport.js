const JwtStrategy = require('passport-jwt').Strategy;
const BearerStrategy = require('passport-http-bearer');
const { ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');
const authProviders = require('../api/services/authProviders');
const Admin = require('../api/models/admin.model');
const Operator = require('../api/models/Operator.model');

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const jwt = async (payload, done) => {
  try {
    // Check if it's an operator token
    if (payload.userType === 'operator') {
      const operator = await Operator.findById(payload.sub);
      if (operator && !operator.isDeleted) {
        // Add userType to distinguish from admin
        const operatorUser = operator.toObject({ virtuals: true });
        operatorUser.userType = 'operator';
        operatorUser.id = operatorUser._id.toString(); // Ensure id field is available
        return done(null, operatorUser);
      }
    } else {
      // Default to admin authentication
      const user = await Admin.findById(payload.sub);
      if (user) {
        const adminUser = user.toObject();
        adminUser.userType = 'admin';
        return done(null, adminUser);
      }
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

const oAuth = service => async (token, done) => {
  try {
    const userData = await authProviders[service](token);
    const user = await Admin.oAuthLogin(userData);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

exports.jwt = new JwtStrategy(jwtOptions, jwt);
exports.facebook = new BearerStrategy(oAuth('facebook'));
exports.google = new BearerStrategy(oAuth('google'));
