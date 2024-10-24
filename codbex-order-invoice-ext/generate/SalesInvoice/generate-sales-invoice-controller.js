const app = angular.module('templateApp', ['ideUI', 'ideView'])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-invoices.salesinvoice.SalesInvoice';
    }]);
app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {
    const params = ViewParameters.get();
    $scope.showDialog = true;

    $scope.entity = {};
    $scope.forms = {
        details: {},
    };

    const salesOrderDataUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderData/" + params.id;
    const salesOrderItemsUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderItemsData/" + params.id;
    const advanceInvoicesUrl = "/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/advanceInvoiceData/" + params.id;
    const invoiceUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceService.ts/";
    const invoiceItemUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/salesinvoice/SalesInvoiceItemService.ts/"
    const paymentMethodsUrl = "/services/ts/codbex-methods/gen/codbex-methods/api/Methods/PaymentMethodService.ts/";

    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        });

    $http.get(salesOrderItemsUrl)
        .then(function (response) {
            $scope.SalesOrderItemsData = response.data;
        });

    $http.get(paymentMethodsUrl)
        .then(function (response) {
            let paymenMethodOptions = response.data;

            $scope.optionsPaymentMethod = paymenMethodOptions.map(function (value) {
                return {
                    value: value.Id,
                    text: value.Name
                };
            });
        });

    $http.get(advanceInvoicesUrl).then(function (response) {
        $scope.advanceInvoices = response.data;
    });

    $scope.selectedAdvanceInvoices = [];

    $scope.updateSelectedAdvanceInvoices = function (advance) {
        if (advance.selected) {
            $scope.selectedAdvanceInvoices.push(advance);
        } else {
            $scope.selectedAdvanceInvoices = $scope.selectedAdvanceInvoices.filter(function (item) {
                return item.Id !== advance.Id;
            });
        }
    };

    $scope.generateInvoice = function () {
        let invoiceData = $scope.SalesOrderData;
        invoiceData.Date = new Date();
        const dueDate = new Date(invoiceData.Date);
        dueDate.setMonth(dueDate.getMonth() + 1);
        invoiceData.Due = dueDate;
        invoiceData.PaymentMethod = $scope.entity.PaymentMethod;
        invoiceData.SalesOrder = params.id;

        if ($scope.entity.fullInvoice || $scope.entity.partialInvoice) {
            invoiceData.SalesInvoiceType = $scope.entity.fullInvoice ? 1 : 2; // Full = 1, Partial = 2

            $http.post(invoiceUrl, invoiceData)
                .then(function (response) {
                    $scope.Invoice = response.data;

                    console.log($scope.selectedAdvanceInvoices);
                    $scope.selectedAdvanceInvoices.forEach(advanceInvoice => {
                        const advanceInvoiceItem = {
                            "SalesInvoice": $scope.Invoice.Id,
                            "Name": `Advance Invoice ${advanceInvoice.Number} from ${advanceInvoice.Date}`, // Customize name if needed
                            "Quantity": 1,
                            "UoM": 17, // Example Unit of Measure (Pieces)
                            "Price": - advanceInvoice.PaymentAmount // Use advance invoice payment amount
                        };
                        $http.post(invoiceItemUrl, advanceInvoiceItem)
                            .then(itemResponse => {
                                console.log("Advance invoice item created successfully:", itemResponse.data);
                            })
                            .catch(itemError => {
                                console.error("Error creating advance invoice item:", itemError);
                            });
                    });

                    // Also create standard items for sales order items if required
                    $scope.SalesOrderItemsData.forEach(orderItem => {
                        const salesInvoiceItem = {
                            "SalesInvoice": $scope.Invoice.Id,
                            "Name": orderItem.Name,
                            "Quantity": orderItem.Quantity,
                            "UoM": orderItem.UoM,
                            "Price": orderItem.Price
                        };
                        $http.post(invoiceItemUrl, salesInvoiceItem);
                    });

                    console.log("Full/Partial Invoice created successfully: ", response.data);
                    messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created");
                    $scope.closeDialog();
                })
                .catch(function (error) {
                    console.error("Error creating invoice: ", error);
                });

        } else if ($scope.entity.advanceInvoice) {
            invoiceData.SalesInvoiceType = 3; // Advance = 3
            invoiceData.Amount = $scope.entity.PaymentAmount;

            // Post advance invoice
            $http.post(invoiceUrl, invoiceData)
                .then(function (response) {
                    $scope.Invoice = response.data;

                    const advanceInvoiceItem = {
                        "SalesInvoice": $scope.Invoice.Id,
                        "Name": "Advance Payment",
                        "Quantity": 1,
                        "UoM": 17, // Pieces
                        "Price": $scope.entity.PaymentAmount
                    };
                    $http.post(invoiceItemUrl, advanceInvoiceItem);

                    console.log("Advance Invoice created: ", response.data);
                    messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created with advance amount deducted");
                    $scope.closeDialog();
                })
                .catch(function (error) {
                    console.error("Error creating advance invoice: ", error);
                });
        }
    };

    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-invoice-generate");
    };

    document.getElementById("dialog").style.display = "block";
}]);