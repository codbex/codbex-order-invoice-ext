let angularHttp;

const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    angularHttp = $http;
    const urlString = window.location.href.toLowerCase();
    const url = new URL(urlString);
    let purchaseOrderId = url.searchParams.get("id");

    fetchPurchaseOrder(purchaseOrderId)
        .then(function (order) {
            $scope.Order = order;
            return fetchPurchaseOrderItems(purchaseOrderId);
        })
        .then(function (orderItems) {
            $scope.OrderItems = orderItems;
            return fetchSupplier($scope.Order.Customer);
        })
        .then(function (customer) {
            $scope.Customer = customer;
            return fetchCompany($scope.Order.Company);
        })
        .then(function (company) {
            $scope.Company = company;
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });


    function fetchPurchaseOrder(purchaseOrderId) {
        const headerUrl = "/services/ts/codbex-orders/gen/api/PurchaseOrder/PurchaseOrderService.ts/" + purchaseOrderId;
        return angularHttp.get(headerUrl)
            .then(function (response) {
                return response.data;
            });
    }

    function fetchPurchaseOrderItems(purchaseOrderId) {
        let itemsUrl = "/services/ts/codbex-orders/gen/api/PurchaseOrder/PurchaseOrderItemService.ts?PurchaseOrder=" + purchaseOrderId;
        return angularHttp.get(itemsUrl)
            .then(function (response) {
                const orderItems = response.data;
                return Promise.all(orderItems.map(orderItem => {
                    let itemUrl = "/services/ts/codbex-products/gen/api/Products/ProductService.ts/" + orderItem.Product;
                    return angularHttp.get(itemUrl)
                        .then(function (response) {
                            orderItem.Product = response.data.Name;
                            return orderItem;
                        });
                }));
            });
    }

    function fetchCompany(purchaseOrderCompanyId) {
        if (!purchaseOrderCompanyId) {
            return Promise.resolve(null);
        }

        const companyUrl = "/services/ts/codbex-companies/gen/api/Companies/CompanyService.ts/" + purchaseOrderCompanyId;
        return angularHttp.get(companyUrl)
            .then(function (response) {
                const company = response.data;
                const cityUrl = "/services/ts/codbex-companies/gen/api/Cities/CityService.ts/" + company.City;
                const countryUrl = "/services/ts/codbex-countries/gen/api/Countries/CountryService.ts/" + company.Country;
                return Promise.all([
                    angularHttp.get(cityUrl),
                    angularHttp.get(countryUrl)
                ]).then(function (values) {
                    company.CityName = values[0].data.Name;
                    company.CountryName = values[1].data.Name;
                    return company;
                });
            });
    }

    function fetchSupplier(supplierId) {
        const supplierUrl = "/services/ts/codbex-partners/gen/api/Suppliers/SupplierService.ts/" + supplierId;
        return angularHttp.get(supplierUrl)
            .then(function (response) {
                return response.data;
            });
    }
});
