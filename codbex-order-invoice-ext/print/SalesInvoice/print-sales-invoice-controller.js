const app = angular.module('templateApp', ['ideUI', 'ideView']);
app.controller('templateController', ['$scope', '$http', 'ViewParameters', function ($scope, $http, ViewParameters) {
    const params = ViewParameters.get();

    const printSalesInvoiceUrl = "/services/ts/codbex-order-invoice-ext/print/SalesInvoice/api/SalesInvoiceService.ts/" + params.id;

    $http.get(printSalesInvoiceUrl)
        .then(function (response) {
            $scope.Invoice = response.data.salesInvoice;
            $scope.InvoiceItems = response.data.salesInvoiceItems;
            $scope.Customer = response.data.customer;
            $scope.Company = response.data.company;
        });
}]);
