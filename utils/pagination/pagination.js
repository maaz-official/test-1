/**
 * Paginates an array of data.
 * @param {Array} data - The data to paginate.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {Object} - Paginated data with total pages and current page.
 */
const paginate = (data, page = 1, limit = 10) => {
    const total = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return {
        totalPages,
        currentPage: page,
        data: paginatedData,
    };
};

module.exports = { paginate };
