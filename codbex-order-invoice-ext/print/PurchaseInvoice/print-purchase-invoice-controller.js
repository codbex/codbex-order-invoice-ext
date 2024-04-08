const app = angular.module('templateApp', ['ideUI', 'ideView']);
app.controller('templateController', ['$scope', '$http', 'ViewParameters', function ($scope, $http, ViewParameters) {
    const params = ViewParameters.get();

    const printPurchaseInvoiceUrl = "/services/ts/codbex-order-invoice-ext/print/PurchaseInvoice/api/PurchaseInvoiceService.ts/" + params.id;

    $http.get(printPurchaseInvoiceUrl)
        .then(function (response) {
            $scope.Invoice = response.data.purchaseInvoice;
            $scope.InvoiceItems = response.data.purchaseInvoiceItems;
            $scope.Supplier = response.data.supplier;
            $scope.Company = response.data.company;
        });
}]);
