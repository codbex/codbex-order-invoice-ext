const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    const urlString = window.location.href.toLowerCase();
    const url = new URL(urlString);
    let purchaseOrderId = url.searchParams.get("id");

    const printPurchaseOrderUrl = "/services/ts/codbex-order-invoice-ext/print/PurchaseOrder/api/PurchaseOrderService.ts/" + purchaseOrderId;

    $http.get(printPurchaseOrderUrl)
        .then(function (response) {
            $scope.Order = response.data.purchaseOrder;
            $scope.OrderItems = response.data.purchaseOrderItems;
            $scope.Supplier = response.data.supplier;
            $scope.Company = response.data.company;
        });
});
