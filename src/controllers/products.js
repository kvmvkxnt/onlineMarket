import { InternalServerError, notFoundError } from '../utils/errors.js';
import { read, write } from '../utils/model.js';

function GET(req, res, next) {
  try {
    let products = read('products');
    let { id } = req.params;
    let subcategories = read('subcategories');
    let categories = read('categories');
    let { categoryId, subCategoryId, model, color, price } = req.query;

    console.log(req.query);

    products.map(prod => {
      prod.subCategoryId = prod.sub_category_id;
      prod.productName = prod.product_name;
      prod.productId = prod.product_id;

      delete prod.sub_category_id;
      delete prod.product_name;
      delete prod.product_id;
      return prod;
    });

    if (id) {
      let [product] = products.filter(prod => prod.productId == id);

      res.status(200).json({
        status: 200,
        message: 'ok',
        data: product
      });
    }

    if (!categoryId && !subCategoryId && !model && !color && !price) {
      res.status(200).json({
        status: 200,
        message: 'ok',
        data: products
      });
    }
    
    let filtered = products.filter(prod => {
      let byCategory = categoryId ? subcategories.find(sub => sub.sub_category_id == prod.subCategoryId).category_id == categoryId : true;
      let bySubCategory = subCategoryId ? prod.subCategoryId == subCategoryId : true;
      let byModel = model ? prod.model.match(new RegExp(model, 'gi')) : true;
      let byColor = color ? prod.color == color : true;
      let byPrice = price ? Number(prod.price) <= Number(price) : true;
      return byCategory && bySubCategory && byModel && byColor && byPrice;
    });

    res.status(200).json({
      status: 200,
      message: 'ok',
      data: filtered
    });

  } catch (e) {
    return next(new InternalServerError(500, e.message));
  }
}

function POST(req, res, next) {
  try {
    let products = read('products');
    let subcategories = read('subcategories');
    let { subCategoryId, productName, price, color, model } = req.body;

    if (!subcategories.find(sub => sub.sub_category_id == subCategoryId)) {
      return next(new notFoundError(404, 'subcategory not found'));
    }

    let newProduct = {
      product_id: products.at(-1)?.product_id + 1 || 1,
      sub_category_id: Number(subCategoryId),
      model,
      product_name: productName,
      color,
      price
    }

    products.push(newProduct);
    write('products', products);

    req.body.productId = products.at(-1)?.product_id + 1 || 1;
    req.body.subCategoryId = Number(subCategoryId);

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
    let products = read('products');
    let subcategories = read('subcategories');
    let { id } = req.params;
    let editable = products.find(prod => prod.product_id == id);

    if (!editable) {
      return next(new notFoundError(404, 'no such product found'));
    }

    editable.productName = editable.product_name;
    editable.subCategoryId = editable.sub_category_id;

    for (let key in req.body) {
      if (key == 'subCategoryId') {
        let sub = subcategories.find(sub => sub.sub_category_id == Number(req.body[key]));

        if (!sub) {
          return next(new notFoundError(404, 'subcategory not found'));
        }

        editable[key] = Number(req.body[key]);
      } else {
        editable[key] = req.body[key];
      }
    }

    editable.product_name = editable.productName;
    editable.sub_category_id = editable.subCategoryId;

    delete editable.productName;
    delete editable.subCategoryId;

    write('products', products);

    editable.productName = editable.product_name;
    editable.subCategoryId = editable.sub_category_id;
    editable.productId = editable.product_id;

    delete editable.sub_category_id;
    delete editable.product_name;
    delete editable.product_id;

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
    let products = read('products');
    let { id } = req.params;
    let deleteIndex = products.findIndex(prod => prod.product_id == id);

    if (deleteIndex == -1) {
      return next(new notFoundError(404, 'no such product found'));
    }

    products[deleteIndex].productId = products[deleteIndex].product_id;
    products[deleteIndex].subCategoryId = products[deleteIndex].sub_category_id;
    products[deleteIndex].productName = products[deleteIndex].product_name;

    delete products[deleteIndex].product_id;
    delete products[deleteIndex].sub_category_id;
    delete products[deleteIndex].product_name;

    let [deleted] = products.splice(deleteIndex, 1);

    write('products', products);

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
