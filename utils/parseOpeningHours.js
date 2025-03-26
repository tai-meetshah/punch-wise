module.exports = function parseOpeningHours(openingHours) {
    const daysOfWeek = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
    ];

    if (openingHours && typeof openingHours === 'object') {
        for (const day of daysOfWeek) {
            if (openingHours[day] === 'undefined') {
                openingHours[day] = undefined;
            }
        }
    }

    return openingHours;
};
