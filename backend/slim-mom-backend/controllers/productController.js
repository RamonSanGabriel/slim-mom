import { Product } from "../models/productModel.js";
import {HttpError} from "../errors/HttpError.js";

const listProducts = async (req, res) => {
    const { page = 1, limit = 20, categories, weight, title, calories, bloodType } = req.query;
    // const query = favorite !== undefined && favorite !== '' ? { favorite } : {};

    // Construct a query object based on the filter
    const query = {};

    if (categories) {
        query.categories = categories;
    }

    if (weight) {
        query.weight = weight;
    }

    if (title) {
        query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
    }

    if (calories) {
        query.calories = calories;
    }

    if (bloodType) {
        // query.groupBloodNotAllowed = { $ne: bloodType }; // Match any specified boolean values
        query[`groupBloodNotAllowed.${bloodType}`] = true;
    }

    // Query the database
    const products = await Product.find(query);

    /*const result = await Product.find()
        .skip((page - 1) * limit)
        .limit(limit);*/
    res.json(products);
};

const listCategories = async (req, res, next) => {
    try {
        // Extract blood type from the request query
        const { bloodType } = req.query;

        if (bloodType && +bloodType < 1 || +bloodType > 4) {
            return next(new HttpError(400, "Blood type must be between 1 - 4"));
        }

        const filter = (bloodType &&  {[`groupBloodNotAllowed.${bloodType}`]: true}) || {};

        // Find products where the value at groupBloodNotAllowed[bloodTypeNum] is false
        const products = await Product.find(filter).select("categories -_id"); // Only select the 'categories'

        // Extract categories and filter out duplicates using Set
        const categories = [...new Set(products.map(product => product.categories))];

        // Return the list of categories
        res.status(200).json({
            data: categories,
        });
    } catch (error) {
        next(new HttpError(500, 'Error listing categories'));
    }
};

export { listProducts, listCategories };