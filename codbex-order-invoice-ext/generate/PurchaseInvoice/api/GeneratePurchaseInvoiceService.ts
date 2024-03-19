import { PurchaseOrderRepository as PurchaseOrderDao } from "../../../../codbex-orders/gen/dao/purchaseorder/PurchaseOrderRepository";
import { PurchaseOrderItemRepository as PurchaseOrderItemDao } from "../../../../codbex-orders/gen/dao/purchaseorder/PurchaseOrderItemRepository";

import { Controller, Get } from "sdk/http";

@Controller
class SalesOrderService {

    private readonly purchaseOrderDao;
    private readonly purchaseOrderItemDao;

    constructor() {
        this.purchaseOrderDao = new PurchaseOrderDao();
        this.purchaseOrderItemDao = new PurchaseOrderItemDao();
    }

    @Get("/purchaseOrderData/:purchaseOrderId")
    public purchaseOrderData(_: any, ctx: any) {
        const purchaseOrderId = ctx.pathParameters.purchaseOrderId;

        let purchaseOrder = this.purchaseOrderDao.findById(purchaseOrderId);

        return {
            "Date": purchaseOrder.Date,
            "Due": purchaseOrder.Due,
            "Supplier": purchaseOrder.Supplier,
            "Net": purchaseOrder.Net,
            "Currency": purchaseOrder.Currency,
            "Gross": purchaseOrder.Gross,
            "Discount": purchaseOrder.Discount,
            "Taxes": purchaseOrder.Taxes,
            "VAT": purchaseOrder.VAT,
            "Total": purchaseOrder.Total,
            "Conditions": purchaseOrder.Conditions,
            "PaymentMethod": purchaseOrder.PaymentMethod,
            "SentMethod": purchaseOrder.SentMethod,
            "PurchaseInvoiceStatus": 1,
            "Operator": purchaseOrder.Operator,
            "Reference": purchaseOrder.UUID
        };
    }

    @Get("/purchaseOrderItemsData/:purchaseOrderId")
    public purchaseOrderItemsData(_: any, ctx: any) {
        const purchaseOrderId = ctx.pathParameters.purchaseOrderId;

        let purchaseOrder = this.purchaseOrderDao.findById(purchaseOrderId);

        let purchaseOrderItems = this.purchaseOrderItemDao.findAll({
            $filter: {
                equals: {
                    PurchaseOrder: purchaseOrder.Id
                }
            }
        });

        return purchaseOrderItems;
    }
}