const { Router } = require('express');
// const { Promise } = require('mongoose');
// const { getCategoriesBySup } = require('../controllers/category');
const Categories = require('../models/Category');

const router = Router();

//TODO: validar datos antes de insertar

router.post('/new', async (req, res) => {
    try {
        const newCategory = new Categories(req.body)
        await newCategory.save()

        res.status(201).json({
            ok: true,
            category: newCategory
        })
    } catch (error) {
        res.json({
            ok: false,
            msg: error
        })
    }
})

router.get('/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {

        const category = await Categories.findById(categoryId)
        // if(!category) throw 'No existe una categoría con el id seleccionado.'
        // if(!category) res.status(404).send('No existe una categoría con el id seleccionado')

        res.status(201).json(category);
    } catch (error) {
        res.status(404).send('No existe una categoría con el id seleccionado')

    }
})

router.get('/', async (req, res) => {

    try {
        const category = await Categories
            .aggregate([
                { $match: { categorySupId: null } },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: 'categorySupId',
                        as: 'childCategories'
                    }
                }
            ])

        res.status(201).json(category);
    } catch (error) {
        res.status(404).send('No existe una categoría con el id seleccionado')

    }
})

router.get('/bySup/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const category = await Categories
            .find({ categorySupId: categoryId })

        res.status(201).json(category);
    } catch (error) {
        res.status(404).send('No existe una categoría con el id seleccionado')

    }
})

router.put('/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const category = await Categories
            .findByIdAndUpdate(categoryId, req.body)

        res.status(201).json(category);
    } catch (error) {
        res.status(404).send('No existe una categoría con el id seleccionado')

    }
})


//TODO: delete Category Sólo se puede borrar sii no tiene subcategorías ni productos asociados a ninguna de las subcategories.

module.exports = router;