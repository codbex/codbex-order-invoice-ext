
const app = angular.module('templateApp', []);
app.controller('templateContoller', function ($scope, $http) {
    const urlString = window.location.href.toLowerCase();
    const url = new URL(urlString);
    let salesOrderId = url.searchParams.get("id");

    const printSalesOrderUrl = "/services/ts/codbex-order-invoice-ext/print/SalesOrder/api/SalesOrderService.ts/" + salesOrderId;

    $http.get(printSalesOrderUrl)
        .then(function (response) {
            $scope.Order = response.data.salesOrder;
            $scope.OrderItems = response.data.salesOrderItems;
            $scope.Customer = response.data.customer;
            $scope.Company = response.data.company;
        });
});
