const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    const urlString = window.location.href.toLowerCase();
    const url = new URL(urlString);
    let purchaseInvoiceId = url.searchParams.get("id");

    const printPurchaseInvoiceUrl = "/services/ts/codbex-order-invoice-ext/print/PurchaseInvoice/api/PurchaseInvoiceService.ts/" + purchaseInvoiceId;

    $http.get(printPurchaseInvoiceUrl)
        .then(function (response) {
            $scope.Invoice = response.data.purchaseInvoice;
            $scope.InvoiceItems = response.data.purchaseInvoiceItems;
            $scope.Supplier = response.data.supplier;
            $scope.Company = response.data.company;
        });
});
