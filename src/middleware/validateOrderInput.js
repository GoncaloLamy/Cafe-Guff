function isValidDishIds(dishIds) {
    return Array.isArray(dishIds) && dishIds.length > 0;
}

export function isValidBills(bills) {
    return Array.isArray(bills)
        && bills.length >= 2
        && bills.every((bill) => Array.isArray(bill) && bill.length > 0);
}

function isValidNotes(notes) {
    return Array.isArray(notes)
        && notes.every((note) => typeof note === 'string');
}

function isValidCreateInput({ table, dishIds, notes }) {
    return Number.isInteger(table)
        && table > 0
        && isValidDishIds(dishIds)
        && (notes === undefined
            || (isValidNotes(notes) && notes.length === dishIds.length));
}

function hasValidOptionalDishIds(dishIds) {
    return dishIds === undefined || isValidDishIds(dishIds);
}

function hasValidOptionalNotes(notes) {
    return notes === undefined || isValidNotes(notes);
}

function hasMatchingNotes(dishIds, notes) {
    return dishIds === undefined
        || notes === undefined
        || notes.length === dishIds.length;
}

function isValidUpdateInput({ dishIds, notes }) {
    return (dishIds !== undefined || notes !== undefined)
        && hasValidOptionalDishIds(dishIds)
        && hasValidOptionalNotes(notes)
        && hasMatchingNotes(dishIds, notes);
}

function validateInput(isValid) {
    return (req, res, next) => {
        if (!isValid(req.body ?? {})) {
            return res.status(400).json({ error: 'Invalid order' });
        }
        return next();
    };
}

export const validateCreateOrderInput = validateInput(isValidCreateInput);
export const validateUpdateOrderInput = validateInput(isValidUpdateInput);
