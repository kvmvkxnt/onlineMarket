import { ForbiddenError } from '../utils/errors.js';
import jwt from '../utils/jwt.js';
import { read } from '../utils/model.js';

export default (req, _, next) => {
  try {
    let { token } = req.headers;

    if (!token) {
      return next(new ForbiddenError(403, 'token required'));
    }

    let { userId } = jwt.verify(token);

    if (!read('users').find(user => user.id == userId)) {
      return next(new ForbiddenError(403, 'your account is unactive or deleted'));
    }

    req.userId = userId;

    return next();
  } catch (e) {
    return next(new ForbiddenError(403, e.message));
  }
}
