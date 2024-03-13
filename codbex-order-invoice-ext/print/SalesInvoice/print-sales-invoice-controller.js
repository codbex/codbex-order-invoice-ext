let angularHttp;

const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    angularHttp = $http;
    const urlString = window.location.href.toLowerCase();
    const url = new URL(urlString);
    let salesInvoiceId = url.searchParams.get("id");

    fetchSalesInvoice(salesInvoiceId)
        .then(function (invoice) {
            $scope.Invoice = invoice;
            return fetchSalesInvoiceItems(salesInvoiceId);
        })
        .then(function (invoiceItems) {
            $scope.InvoiceItems = invoiceItems;
            return fetchCustomer($scope.Invoice.Customer);
        })
        .then(function (customer) {
            $scope.Customer = customer;
            return fetchCompany($scope.Invoice.Company);
        })
        .then(function (company) {
            $scope.Company = company;
        })
        .catch(function (error) {
            console.error('Error fetching data:', error);
        });


    function fetchSalesInvoice(salesInvoiceId) {
        const headerUrl = "/services/ts/codbex-invoices/gen/api/salesinvoice/SalesInvoiceService.ts/" + salesInvoiceId;
        return angularHttp.get(headerUrl)
            .then(function (response) {
                return response.data;
            });
    }

    function fetchSalesInvoiceItems(salesInvoiceId) {
        let itemsUrl = "/services/ts/codbex-invoices/gen/api/salesinvoice/SalesInvoiceItemService.ts?SalesInvoice=" + salesInvoiceId;
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

    function fetchCompany(salesInvoiceCompanyId) {
        if (!salesInvoiceCompanyId) {
            return Promise.resolve(null);
        }

        const companyUrl = "/services/ts/codbex-companies/gen/api/Companies/CompanyService.ts/" + salesInvoiceCompanyId;
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

    function fetchCustomer(customerId) {
        const customerUrl = "/services/ts/codbex-partners/gen/api/Customers/CustomerService.ts/" + customerId;
        return angularHttp.get(customerUrl)
            .then(function (response) {
                return response.data;
            });
    }
});
