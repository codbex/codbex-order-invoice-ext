import { SalesOrderRepository as SalesOrderDao } from "../../../../codbex-orders/gen/dao/salesorder/SalesOrderRepository";
import { SalesOrderItemRepository as SalesOrderItemDao } from "../../../../codbex-orders/gen/dao/salesorder/SalesOrderItemRepository";

import { Controller, Get } from "sdk/http";

@Controller
class SalesOrderService {

    private readonly salesOrderDao;
    private readonly salesOrderItemDao;

    constructor() {
        this.salesOrderDao = new SalesOrderDao();
        this.salesOrderItemDao = new SalesOrderItemDao();
    }

    @Get("/salesOrderData/:salesOrderId")
    public salesOrderData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let salesOrder = this.salesOrderDao.findById(salesOrderId);

        return {
            "Date": salesOrder.Date,
            "Due": salesOrder.Due,
            "Customer": salesOrder.Customer,
            "Net": salesOrder.Net,
            "Currency": salesOrder.Currency,
            "Gross": salesOrder.Gross,
            "Discount": salesOrder.Discount,
            "Taxes": salesOrder.Taxes,
            "VAT": salesOrder.VAT,
            "Total": salesOrder.Total,
            "Conditions": salesOrder.Conditions,
            "PaymentMethod": salesOrder.PaymentMethod,
            "SentMethod": salesOrder.SentMethod,
            "SalesInvoiceStatus": 1,
            "Operator": salesOrder.Operator,
            "Reference": salesOrder.UUID
        };
    }

    @Get("/salesOrderItemsData/:salesOrderId")
    public salesOrderItemsData(_: any, ctx: any) {
        const salesOrderId = ctx.pathParameters.salesOrderId;

        let salesOrder = this.salesOrderDao.findById(salesOrderId);

        let salesOrderItems = this.salesOrderItemDao.findAll({
            $filter: {
                equals: {
                    SalesOrder: salesOrder.Id
                }
            }
        });

        return salesOrderItems;
    }
}