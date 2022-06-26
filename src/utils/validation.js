import Joi from 'joi';

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const registerSchema = Joi.object({
  username: Joi.string().min(4).max(25).required(),
  password: Joi.string().min(8).required(),
  email: Joi.string().min(6).required(),
  avatar: Joi.binary()
});

const productSchemaPost = Joi.object({
  subCategoryId: Joi.number().required(),
  productName: Joi.string().required(),
  price: Joi.string().required(),
  color: Joi.string().required(),
  model: Joi.string().required()
});

const productSchemaPut = Joi.object({
  subCategoryId: Joi.number(),
  productName: Joi.string(),
  price: Joi.string(),
  color: Joi.string(),
  model: Joi.string()
});

export {
  loginSchema,
  registerSchema,
  productSchemaPut,
  productSchemaPost
}
