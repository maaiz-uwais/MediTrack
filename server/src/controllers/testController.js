const Test = require('../models/Test');
const Package = require('../models/Package');

// @desc    Get All Diagnostic Tests
// @route   GET /api/tests
// @access  Public
const getAllTests = async (req, res, next) => {
  try {
    const { category, search, sampleType, fasting } = req.query;
    let query = { isActive: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (sampleType && sampleType !== 'All') {
      query.sampleType = sampleType;
    }

    if (fasting === 'true') {
      query.fastingRequired = true;
    } else if (fasting === 'false') {
      query.fastingRequired = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tests = await Test.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Test by ID
// @route   GET /api/tests/:id
// @access  Public
const getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic test not found.',
      });
    }

    res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Diagnostic Test
// @route   POST /api/tests
// @access  Private (Admin)
const createTest = async (req, res, next) => {
  try {
    const {
      name,
      code,
      category,
      description,
      price,
      discountPrice,
      sampleType,
      fastingRequired,
      fastingDurationHours,
      tatHours,
      precautions,
    } = req.body;

    const existingTest = await Test.findOne({
      $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }],
    });

    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: 'A test with this name or code already exists.',
      });
    }

    const test = await Test.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : Number(price),
      sampleType: sampleType || 'Blood',
      fastingRequired: Boolean(fastingRequired),
      fastingDurationHours: Number(fastingDurationHours) || 0,
      tatHours: Number(tatHours) || 24,
      precautions: precautions || 'No special precautions required.',
    });

    res.status(201).json({
      success: true,
      message: 'Diagnostic test created successfully.',
      test,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Diagnostic Test
// @route   PUT /api/tests/:id
// @access  Private (Admin)
const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic test not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Diagnostic test updated successfully.',
      test,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Diagnostic Test
// @route   DELETE /api/tests/:id
// @access  Private (Admin)
const deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic test not found.',
      });
    }

    // Toggle active or delete
    await Test.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Test '${test.name}' removed from catalog.`,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== PACKAGES ====================

// @desc    Get All Health Packages
// @route   GET /api/tests/packages/all
// @access  Public
const getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({ isActive: true })
      .populate('tests', 'name code category price sampleType tatHours')
      .sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Health Package
// @route   POST /api/tests/packages
// @access  Private (Admin)
const createPackage = async (req, res, next) => {
  try {
    const {
      title,
      tests,
      price,
      discountPrice,
      description,
      recommendedFor,
      fastingRequired,
    } = req.body;

    const pkg = await Package.create({
      title: title.trim(),
      tests: tests || [],
      price: Number(price),
      discountPrice: Number(discountPrice || price),
      description,
      recommendedFor: recommendedFor || 'General wellness',
      fastingRequired: Boolean(fastingRequired),
    });

    const populatedPkg = await Package.findById(pkg._id).populate('tests');

    res.status(201).json({
      success: true,
      message: 'Health package created successfully.',
      package: populatedPkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Health Package
// @route   PUT /api/tests/packages/:id
// @access  Private (Admin)
const updatePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('tests');

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Health package not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Health package updated successfully.',
      package: pkg,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Health Package
// @route   DELETE /api/tests/packages/:id
// @access  Private (Admin)
const deletePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Health package not found.',
      });
    }

    await Package.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Package '${pkg.title}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
