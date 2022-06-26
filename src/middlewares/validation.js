import { loginSchema, registerSchema, productSchemaPut, productSchemaPost } from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';

export default (req, res, next) => {
  try {
    if (req.url == '/login') {
      let { error } = loginSchema.validate(req.body);
      if (error) throw error;
    }

    if (req.url == '/register') {
      let { error } = registerSchema.validate(req.body);
      if (error) throw error;
    }

    if (req.url == '/products') {
      let { error } = productSchemaPost.validate(req.body);
      if (error) throw error;
    }

    if (req.url == `/products/${req.params.id}`) {
      let { error } = productSchemaPut.validate(req.body);
      if (error) throw error;
    }

    return next();

  } catch (e) {
    return next( new ValidationError(401, e.message));
  }
}
