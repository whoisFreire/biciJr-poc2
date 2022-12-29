const { BikeApi } = require('../services/bikeApi');

function filterBikes(filter, subFilter, data) {
    if (filter === 'price') {
        if (new RegExp(/(500,00)$/, 'i').test(subFilter)) {
            const bikesByFilter = data.filter(bike => bike.price <= 500);
            return bikesByFilter;
        }
        if (new RegExp(/(1500,00)$/, 'i').test(subFilter)) {
            const bikesByFilter = data.filter(bike => bike.price >= 500 && bike.price <= 1500);
            return bikesByFilter;
        }
        if (new RegExp(/(De R\$ 1500,00 até R\$ 3000,00)/, 'i').test(subFilter)) {
            const bikesByFilter = data.filter(bike => bike.price >= 1500 && bike.price <= 3000);
            return bikesByFilter;
        }
        if (new RegExp(/(3000,00)$/, 'i').test(subFilter)) {
            const bikesByFilter = data.filter(bike => bike.price > 3000);
            return bikesByFilter;
        }
    }
    const bikesByFilter = data.filter(bike => bike[filter].toLowerCase() === subFilter.toLowerCase());
    return bikesByFilter;
};

module.exports = {
    async getBikes(filter, subfilter) {
        const response = await BikeApi.fetch();
        const { data } = response;
        if (new RegExp(/(Outras cores)/, 'i').test(subfilter)) {
            return data;
        }
        const bikes = filterBikes(filter, subfilter, data);
        return bikes;
    }
};
