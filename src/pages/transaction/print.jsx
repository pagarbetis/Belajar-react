import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "/src/services/api.js";
import { Button } from "@/components/ui/button";

const PrintTransaction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");
  const status = searchParams.get("transaction_status");

  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/transaction/${orderId}`);
        setOrder(res.data);
      } catch (error) {
        console.log("Failed fetch data transaction", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="max-w-md mx-auto my-6 space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Button variant="outline" onClick={() => navigate("/transaction")}>
            Back
          </Button>
          <Button onClick={handlePrint} size="sm" className="bg-primary">
            Print Struck
          </Button>
        </div>
      </div>
      <Card className="p-6 font-mono text-xs text-black bg-white border shadow-none border-border/80 print:border-none">
        <CardHeader className="p-0 pb-4 text-center border border-b-dashed border-zinc-400">
          <CardTitle className="text-base font-bold tracking-wider uppercase">
            Warung Madara
          </CardTitle>
          <p className="text-[11px] text-zinc-600">Jl Cikanjoet</p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {new Date().toLocaleString("id-ID")}
          </p>
        </CardHeader>
        <CardContent className="p-0 pt-3 space-y-3">
          <div className="space-y-0.5 text-[11px]">
            <div className="flex items-start justify-between">
              <span>Order Number</span>
              <span className="uppercase">{orderId}</span>
            </div>
            <div className="flex items-start justify-between">
              <span>Payment Method</span>
              <span className="uppercase">{order.payment_method}</span>
            </div>
          </div>
          <div className="pt-2 space-y-2 border-t border-dashed border-zinc-400">
          {order?.items?.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="font-semibold">{item.name}</div>
                <div className="text-[11px] text-zinc-600">
                  {item.qty} x {item.price.toLocaleString("id-ID")}
                </div>
                <div className="font-medium">
                  Rp. {(item.qty * item.price).toLocaleString("id-ID")}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between">
              <span>Total Payment</span>
              <span>Rp. 100.000</span>
            </div>
          )}
          
            <div className="flex items-center justify-between">
              <div className="font-semibold">Mie Sedap</div>
              <div className="text-[11px] text-zinc-600">1 x Rp.100.000</div>
              <div className="font-medium">Rp.100.000</div>
            </div>
            <div className="pt-2 space-y-1 border-t border-dashed border-zinc-400">
              {order?.subtotal && (
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp. {order.subtotal.toLocaleString("id-ID")}</span>
                </div>
              )}
              {order?.tax && (
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>Rp. {order.tax.toLocaleString("id-ID")}</span>
                </div>
              )}
              {order?.total && (
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>Rp. {order.total.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>
          <div className="border border-t-dashed border-zinc-400">
            <p className="text-semibold">Thank You</p>
            <p className="text-[10px] text-zinc-500">Please come back again</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PrintTransaction;
