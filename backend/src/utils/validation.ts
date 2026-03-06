import Joi from 'joi';

export const studentVerificationSchema = Joi.object({
  student_id: Joi.string().required(),
  email: Joi.string().email().required(),
  full_name: Joi.string().required(),
});

export const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().required(),
  student_id: Joi.string().required(),
});

export const createProductSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  condition: Joi.string().valid('novo', 'como_novo', 'usado').required(),
  price: Joi.number().positive().required(),
  location: Joi.string().required(),
  image_urls: Joi.array().items(Joi.string().uri()),
  stock: Joi.number().integer().positive().required(),
});

export const updateProductSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  category: Joi.string(),
  condition: Joi.string().valid('novo', 'como_novo', 'usado'),
  price: Joi.number().positive(),
  location: Joi.string(),
  image_urls: Joi.array().items(Joi.string().uri()),
  stock: Joi.number().integer().positive(),
  is_active: Joi.boolean(),
}).min(1);

export const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().required(),
});

export const createMessageSchema = Joi.object({
  recipient_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().allow(null),
  content: Joi.string().required(),
});

export const addToCartSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().positive().required(),
});

export const validate = (schema: Joi.Schema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map(x => x.message);
    throw new Error(errors.join(', '));
  }
  return value;
};
