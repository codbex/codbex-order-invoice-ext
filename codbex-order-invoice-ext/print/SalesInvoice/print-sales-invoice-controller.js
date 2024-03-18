const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    const urlString = window.location.href.toLowerCase();
    const url = new URL(urlString);
    let salesInvoiceId = url.searchParams.get("id");

    const printSalesInvoiceUrl = "/services/ts/codbex-order-invoice-ext/print/SalesInvoice/api/SalesInvoiceService.ts/" + salesInvoiceId;

    $http.get(printSalesInvoiceUrl)
        .then(function (response) {
            $scope.Invoice = response.data.salesInvoice;
            $scope.InvoiceItems = response.data.salesInvoiceItems;
            $scope.Customer = response.data.customer;
            $scope.Company = response.data.company;
        });
});
