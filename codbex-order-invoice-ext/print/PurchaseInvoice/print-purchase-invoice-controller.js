let angularHttp;

const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    angularHttp = $http;
    const urlString = window.location.href.toLowerCase();
    const url = new URL(urlString);
    let purchaseInvoiceId = url.searchParams.get("id");

    fetchPurchaseInvoice(purchaseInvoiceId)
        .then(function (invoice) {
            $scope.Invoice = invoice;
            return fetchPurchaseInvoiceItems(purchaseInvoiceId);
        })
        .then(function (invoiceItems) {
            $scope.InvoiceItems = invoiceItems;
            return fetchSupplier($scope.Invoice.Supplier);
        })
        .then(function (supplier) {
            $scope.Supplier = supplier;
            return fetchCompany($scope.Invoice.Company);
        })
        .then(function (company) {
            $scope.Company = company;
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });


    function fetchPurchaseInvoice(purchaseInvoiceId) {
        const headerUrl = "/services/ts/codbex-invoices/gen/api/purchaseinvoice/PurchaseInvoiceService.ts/" + purchaseInvoiceId;
        return angularHttp.get(headerUrl)
            .then(function (response) {
                return response.data;
            });
    }

    function fetchPurchaseInvoiceItems(purchaseInvoiceId) {
        let itemsUrl = "/services/ts/codbex-invoices/gen/api/purchaseinvoice/PurchaseInvoiceItemService.ts?PurchaseInvoice=" + purchaseInvoiceId;
        return angularHttp.get(itemsUrl)
            .then(function (response) {
                const invoiceItems = response.data;
                return Promise.all(invoiceItems.map(invoiceItem => {
                    let itemUrl = "/services/ts/codbex-products/gen/api/Products/ProductService.ts/" + invoiceItem.Product;
                    return angularHttp.get(itemUrl)
                        .then(function (response) {
                            invoiceItem.Product = response.data.Name;
                            return invoiceItem;
                        });
                }));
            });
    }

    function fetchCompany(purchaseInvoiceCompanyId) {
        if (!purchaseInvoiceCompanyId) {
            return Promise.resolve(null);
        }

        const companyUrl = "/services/ts/codbex-companies/gen/api/Companies/CompanyService.ts/" + purchaseInvoiceCompanyId;
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

    // function fetchMethod(supplierId) {
    //     const supplierUrl = "/services/ts/codbex-partners/gen/api/Suppliers/SupplierService.ts/" + supplierId;
    //     return angularHttp.get(supplierUrl)
    //         .then(function (response) {
    //             return response.data;
    //         });
    // }

    function fetchSupplier(supplierId) {
        const supplierUrl = "/services/ts/codbex-partners/gen/api/Suppliers/SupplierService.ts/" + supplierId;
        return angularHttp.get(supplierUrl)
            .then(function (response) {
                return response.data;
            });
    }
});
