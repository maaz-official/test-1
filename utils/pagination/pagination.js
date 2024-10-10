/**
 * Paginates an array of data with optional sorting.
 * @param {Array} data - The data to paginate.
 * @param {number} [page=1] - The current page number (1-based).
 * @param {number} [limit=10] - The number of items per page.
 * @param {string} [sortBy] - The property to sort by (optional).
 * @param {boolean} [descending=false] - Sort in descending order (optional).
 * @returns {Object} - Paginated data with total pages, current page, total items, and sorted data.
 * @throws {Error} - Throws an error for invalid inputs.
 */
const paginate = (data, page = 1, limit = 10, sortBy = null, descending = false) => {
    // Input validation
    if (!Array.isArray(data)) {
        throw new Error('Data must be an array.');
    }
    if (typeof page !== 'number' || page < 1) {
        throw new Error('Page must be a positive integer.');
    }
    if (typeof limit !== 'number' || limit < 1) {
        throw new Error('Limit must be a positive integer.');
    }

    // Sort data if sortBy is provided
    if (sortBy) {
        data = data.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return descending ? 1 : -1;
            if (a[sortBy] > b[sortBy]) return descending ? -1 : 1;
            return 0;
        });
    }

    const total = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return {
        totalPages,
        currentPage: page,
        totalItems: total,
        data: paginatedData,
    };
};

module.exports = { paginate };


// const items = [
//     { id: 1, name: 'Item A' },
//     { id: 2, name: 'Item B' },
//     { id: 3, name: 'Item C' },
//     { id: 4, name: 'Item D' },
//     { id: 5, name: 'Item E' },
//     { id: 6, name: 'Item F' },
//     { id: 7, name: 'Item G' },
//     { id: 8, name: 'Item H' },
//     { id: 9, name: 'Item I' },
//     { id: 10, name: 'Item J' },
//     { id: 11, name: 'Item K' },
// ];

// try {
//     const paginatedResult = paginate(items, 1, 5, 'name', false);
//     console.log(paginatedResult);
// } catch (error) {
//     console.error('Pagination error:', error.message);
// }