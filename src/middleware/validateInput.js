function validateInput(requiredFields = []) {
    return (req, res, next) => {
        const errors = [];

        requiredFields.forEach((field) => {
            const value = req.body[field];

            if (value === undefined || value === null || value === '') {
                errors.push(`${field} is required`);
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    };
}

module.exports = validateInput;
