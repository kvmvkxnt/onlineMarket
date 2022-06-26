import { read, write } from '../utils/model.js';
import { notFoundError, ForbiddenError, InternalServerError } from '../utils/errors.js';

function GET(req, res, next) {
  try {
    let subcategories = read('subcategories');
    let products = read('products');
    let { id } = req.params;

    products.map(prod => {
      prod.productId = prod.product_id;
      prod.productName = prod.product_name;

      delete prod.product_id;
      delete prod.product_name;
      return prod;
    });

    subcategories.map(sub => {
      sub.subCategoryId = sub.sub_category_id;
      sub.subCategoryName = sub.sub_category_name;

      delete sub.sub_category_name;
      delete sub.category_id;
      delete sub.sub_category_id;

      sub.products = products.filter(prod => prod.sub_category_id == sub.subCategoryId).map(prod => {
        delete prod.sub_category_id;
        return prod;
      }) || [];
    });

    if (id) {
      let [sub] = subcategories.filter(sub => sub.subCategoryId == id);

      res.status(200).json({
        status: 200,
        message: 'ok',
        data: sub
      });
    }

    res.status(200).json({
      status: 200,
      message: 'ok',
      data: subcategories
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function POST(req, res, next) {
  try {
    let categories = read('categories');
    let subcategories = read('subcategories');
    let { categoryId, subCategoryName } = req.body;

    if (!categoryId || !subCategoryName) {
      return next(new ForbiddenError(403, 'no category id or subcategory name'));
    }

    if (!categories.find(cat => cat.category_id == Number(categoryId))) {
      return next(new notFoundError(404, 'category not found'));
    }

    let foundSub = subcategories.find(sub => sub.category_id == Number(categoryId) && sub.sub_category_name == subCategoryName);

    if (foundSub) {
      return next(new ForbiddenError(403, 'this name is already used'));
    }

    req.body.sub_category_id = subcategories.at(-1)?.sub_category_id + 1 || 1;
    req.body.category_id = Number(categoryId);
    req.body.sub_category_name = subCategoryName;

    delete req.body.categoryId;
    delete req.body.subCategoryName;

    subcategories.push(req.body);
    write('subcategories', subcategories);

    req.body.subCategoryId = req.body.sub_category_id;
    req.body.subCategoryName = req.body.sub_category_name;
    req.body.categoryId = req.body.category_id;

    delete req.body.sub_category_id;
    delete req.body.sub_category_name;
    delete req.body.category_id;

    res.status(201).json({
      status: 201,
      message: 'ok',
      data: req.body
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function PUT(req, res, next) {
  try {
    let subcategories = read('subcategories');
    let products = read('products');
    let { id } = req.params;
    let editable = subcategories.find(sub => sub.sub_category_id == id);
    let { subCategoryName } = req.body;

    if (!editable) {
      return next(new notFoundError(404, 'no such product found'));
    }

    if (!subCategoryName) {
      return next(new ForbiddenError(403, 'no name inputted'))
    }

    if (subcategories.find(sub => sub.sub_category_name == subCategoryName)) {
      return next(new ForbiddenError(403, 'this name is already used'));
    }

    editable.sub_category_name = subCategoryName;
    write('subcategories', subcategories);

    editable.subCategoryId = id;
    editable.subCategoryName = subCategoryName;
    editable.products = products.filter(prod => prod.sub_category_id == id).map(prod => {
      prod.productId = prod.product_id;
      prod.productName = prod.product_name;

      delete prod.product_name;
      delete prod.product_id;
      delete prod.sub_category_id;
      return prod;
    }) || [];

    delete editable.sub_category_id;
    delete editable.category_id;
    delete editable.sub_category_name;

    res.status(201).json({
      status: 201,
      message: 'ok',
      data: editable
    });
  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function DELETE(req, res, next) {
  try {
    let subcategories = read('subcategories');
    let products = read('products');
    let { id } = req.params;
    let deletableIndex = subcategories.findIndex(sub => sub.sub_category_id == id);

    if (deletableIndex == -1) {
      return next(new notFoundError(404, 'no such subcategory found'));
    }

    let deleted = subcategories.splice(deletableIndex, 1);
    write('subcategories', subcategories);

    deleted.subCategoryId = deleted.sub_category_id;
    deleted.subCategoryName = deleted.sub_category_name;

    deleted.products = products.filter(prod => prod.sub_category_id == id).map(prod => {
      prod.productId = prod.product_id;
      prod.productName = prod.product_name;

      delete prod.product_name;
      delete prod.product_id;
      delete prod.sub_category_id;
      return prod;
    }) || [];

    delete deleted.category_id;
    delete deleted.sub_category_id;
    delete deleted.sub_category_name;

    res.status(201).json({
      status: 201,
      message: 'ok',
      data: deleted
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

export default {
  GET,
  POST,
  PUT,
  DELETE
}
