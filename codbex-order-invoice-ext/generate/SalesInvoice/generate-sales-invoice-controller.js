const app = angular.module('templateApp', ['ideUI', 'ideView'])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-invoices.salesinvoice.SalesInvoice';
    }]);

app.controller('templateController', ['$scope', '$http', 'ViewParameters', 'messageHub', function ($scope, $http, ViewParameters, messageHub) {
    const params = ViewParameters.get();
    $scope.showDialog = true;

    // Initialize scope objects
    $scope.entity = {};
    $scope.forms = { details: {} };

    const baseApiUrl = "/services/ts/codbex-invoices/gen/codbex-invoices/api/";
    const salesOrderDataUrl = `/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderData/${params.id}`;
    const salesOrderItemsUrl = `/services/ts/codbex-order-invoice-ext/generate/SalesInvoice/api/GenerateSalesInvoiceService.ts/salesOrderItemsData/${params.id}`;
    const invoiceUrl = `${baseApiUrl}salesinvoice/SalesInvoiceService.ts/`;
    const invoiceItemUrl = `${baseApiUrl}salesinvoice/SalesInvoiceItemService.ts/`;
    const paymentMethodsUrl = "/services/ts/codbex-methods/gen/codbex-methods/api/Methods/PaymentMethodService.ts/";

    // Fetch Sales Order Data
    $http.get(salesOrderDataUrl)
        .then(function (response) {
            $scope.SalesOrderData = response.data;
        })
        .catch(function (error) {
            console.error("Error fetching Sales Order Data: ", error);
        });

    // Fetch Sales Order Items Data
    $http.get(salesOrderItemsUrl)
        .then(function (response) {
            $scope.SalesOrderItemsData = response.data;
        })
        .catch(function (error) {
            console.error("Error fetching Sales Order Items Data: ", error);
        });

    // Fetch Payment Methods
    $http.get(paymentMethodsUrl)
        .then(function (response) {
            $scope.optionsPaymentMethod = response.data.map(value => ({
                value: value.Id,
                text: value.Name
            }));
        })
        .catch(function (error) {
            console.error("Error fetching Payment Methods: ", error);
        });

    // Generate Invoice based on user selection (Full, Partial, or Advance)
    $scope.generateInvoice = function () {
        if (!$scope.SalesOrderData || !$scope.entity.PaymentMethod) {
            console.error("Missing Sales Order Data or Payment Method");
            return;
        }

        let invoiceData = angular.copy($scope.SalesOrderData);
        invoiceData.Date = new Date();
        invoiceData.PaymentMethod = $scope.entity.PaymentMethod;

        // Handling different invoice types
        if ($scope.entity.fullInvoice) {
            createFullInvoice(invoiceData);
        } else if ($scope.entity.advanceInvoice || $scope.entity.partialInvoice) {
            createPartialOrAdvanceInvoice(invoiceData);
        }
    };

    // Create Full Invoice
    function createFullInvoice(invoiceData) {
        invoiceData.SalesInvoiceType = 1; // Full Invoice Type
        invoiceData.Net = $scope.SalesOrderData.NetAmount;

        $http.post(invoiceUrl, invoiceData)
            .then(function (response) {
                $scope.Invoice = response.data;
                createInvoiceItems($scope.SalesOrderItemsData, $scope.Invoice.Id);
                messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created");
                $scope.closeDialog();
            })
            .catch(function (error) {
                handleError("Error creating full invoice", error);
            });
    }

    // Create Partial or Advance Invoice
    function createPartialOrAdvanceInvoice(invoiceData) {
        const isAdvance = $scope.entity.advanceInvoice;
        invoiceData.SalesInvoiceType = isAdvance ? 3 : 2; // Advance = 3, Partial = 2

        $http.post(invoiceUrl, invoiceData)
            .then(function (response) {
                $scope.Invoice = response.data;

                const invoiceItem = {
                    SalesInvoice: $scope.Invoice.Id,
                    Name: `${isAdvance ? "Advance Payment" : "Partial Payment"} for Order ${$scope.SalesOrderData.OrderNumber}`,
                    Quantity: 1,
                    UoM: 17, // Pieces
                    Price: $scope.entity.PaymentAmount
                };

                $http.post(invoiceItemUrl, invoiceItem)
                    .then(() => {
                        console.log("Invoice item created successfully");
                    })
                    .catch(function (error) {
                        handleError("Error creating invoice item", error);
                    });

                messageHub.showAlertSuccess("SalesInvoice", "Sales Invoice successfully created");
                $scope.closeDialog();
            })
            .catch(function (error) {
                handleError("Error creating partial/advance invoice", error);
            });
    }

    // Create Invoice Items for Full Invoice
    function createInvoiceItems(orderItems, invoiceId) {
        if (!orderItems || !invoiceId) return;

        orderItems.forEach(orderItem => {
            const salesInvoiceItem = {
                SalesInvoice: invoiceId,
                Name: orderItem.Product,
                Quantity: orderItem.Quantity,
                UoM: orderItem.UoM,
                Price: orderItem.Price
            };

            $http.post(invoiceItemUrl, salesInvoiceItem)
                .then(() => {
                    console.log("Invoice item created successfully");
                })
                .catch(function (error) {
                    handleError("Error creating invoice item", error);
                });
        });
    }

    // Close Dialog
    $scope.closeDialog = function () {
        $scope.showDialog = false;
        messageHub.closeDialogWindow("sales-invoice-generate");
    };

    // Handle error and log details
    function handleError(message, error) {
        console.error(message, error);
        messageHub.showAlertError("SalesInvoice", message);
        $scope.closeDialog();
    }

    document.getElementById("dialog").style.display = "block";
}]);
