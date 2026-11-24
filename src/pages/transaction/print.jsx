import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "../../services/api.js";

const SETTINGS_KEY = "warung_madara_settings";

const DEFAULT_SETTINGS = {
  storeName: "Warung Madara",
  storeAddress: "Jl Cikanjoet",
  defaultTax: 10,
  receiptHeader: "",
  receiptFooter: "Thank You",
  receiptSubFooter: "Please come back again",
  autoPrintReceipt: false,
};

const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      storeName:
        String(parsed?.storeName ?? "").trim() || DEFAULT_SETTINGS.storeName,
      storeAddress:
        parsed?.storeAddress !== undefined
          ? String(parsed.storeAddress)
          : DEFAULT_SETTINGS.storeAddress,
      defaultTax:
        parsed?.defaultTax !== undefined &&
        !Number.isNaN(Number(parsed.defaultTax))
          ? Number(parsed.defaultTax)
          : DEFAULT_SETTINGS.defaultTax,
      receiptHeader:
        parsed?.receiptHeader !== undefined
          ? String(parsed.receiptHeader)
          : DEFAULT_SETTINGS.receiptHeader,
      receiptFooter:
        parsed?.receiptFooter !== undefined && String(parsed.receiptFooter).trim()
          ? String(parsed.receiptFooter)
          : DEFAULT_SETTINGS.receiptFooter,
      receiptSubFooter:
        parsed?.receiptSubFooter !== undefined
          ? String(parsed.receiptSubFooter)
          : DEFAULT_SETTINGS.receiptSubFooter,
      autoPrintReceipt: Boolean(parsed?.autoPrintReceipt),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const extractBaseOrderNumber = (orderId) => {
  const raw = String(orderId || "").trim();
  const match = raw.match(/^(TR-\d{8}-\d+)(?:-\d+)?$/);
  return match ? match[1] : raw;
};

const formatIDR = (val) =>
  Number(val || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

const PrintTransaction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const orderIdParam = searchParams.get("order_id");
  const trxStatusParam = searchParams.get("transaction_status");

  const [storeSettings, setStoreSettings] = useState(() => getStoredSettings());
  const [trxData, setTrxData] = useState(
    () => location.state?.transaction ?? null,
  );
  const [loading, setLoading] = useState(!location.state?.transaction);

  useEffect(() => {
    const syncSettings = () => {
      setStoreSettings(getStoredSettings());
    };

    syncSettings();
    window.addEventListener("warung_madara_settings_updated", syncSettings);
    window.addEventListener("storage", syncSettings);
    return () => {
      window.removeEventListener("warung_madara_settings_updated", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  useEffect(() => {
    const loadTransaction = async () => {
      try {
        setLoading(true);

        if (orderIdParam) {
          try {
            const syncRes = await api.get(
              `/transaction/sync-status?order_id=${encodeURIComponent(orderIdParam)}${
                trxStatusParam
                  ? `&transaction_status=${encodeURIComponent(trxStatusParam)}`
                  : ""
              }`,
            );
            const syncedTrx = syncRes?.data ?? syncRes;
            if (syncedTrx && (syncedTrx.order_number || syncedTrx.id)) {
              setTrxData(syncedTrx);
              sessionStorage.setItem(
                "last_transaction",
                JSON.stringify(syncedTrx),
              );
              return;
            }
          } catch {
            // Lanjut ke fallback di bawah kalau sync-status gagal
          }
        }

        if (location.state?.transaction) {
          setTrxData(location.state.transaction);
          sessionStorage.setItem(
            "last_transaction",
            JSON.stringify(location.state.transaction),
          );
          return;
        }

        const baseOrder = extractBaseOrderNumber(orderIdParam);
        const saved = sessionStorage.getItem("last_transaction");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (
              !orderIdParam ||
              parsed.order_number === orderIdParam ||
              parsed.order_number === baseOrder
            ) {
              setTrxData(parsed);
              return;
            }
          } catch {
            // ignore invalid json
          }
        }

        if (orderIdParam) {
          const res = await api.get("/transaction");
          const list = Array.isArray(res) ? res : res?.data ?? [];
          const matched = list.find(
            (item) =>
              String(item.order_number) === String(orderIdParam) ||
              String(item.order_number) === baseOrder ||
              String(item.id) === String(orderIdParam),
          );
          if (matched) {
            setTrxData(matched);
          }
        }
      } catch (err) {
        console.log("Failed load transaction for print:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [location.state, orderIdParam, trxStatusParam]);

  useEffect(() => {
    if (!loading && trxData && storeSettings.autoPrintReceipt) {
      const timer = setTimeout(() => {
        window.print();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [loading, trxData, storeSettings.autoPrintReceipt]);

  const handlePrint = () => {
    window.print();
  };

  const orderNumber =
    trxData?.order_number ?? trxData?.orderNumber ?? orderIdParam ?? "-";

  const paymentMethod = String(
    trxData?.payment_method ?? trxData?.paymentMethod ?? "CASH",
  ).toUpperCase();

  const effectiveStatus =
    trxData?.status ??
    trxStatusParam ??
    (paymentMethod === "CASH" ? "PAID" : "");

  const items = Array.isArray(trxData?.items) ? trxData.items : [];

  const subtotalFromItems = items.reduce((sum, it) => {
    const qty = Number(it.quantity ?? it.qty ?? 1);
    const price = Number(it.unitPrice ?? it.price ?? 0);
    const lineSub = it.subtotal ?? qty * price;
    return sum + Number(lineSub || 0);
  }, 0);

  const subtotal =
    items.length > 0
      ? subtotalFromItems
      : trxData?.subtotal !== undefined
        ? Number(trxData.subtotal)
        : 0;

  const taxRate = Number(storeSettings.defaultTax || 0);
  const fallbackTax = Math.round(subtotal * (taxRate / 100));

  const totalFromDetails = trxData?.payment_details?.total;
  const totalFromOrder = trxData?.total ?? trxData?.totalAmount;
  const total =
    totalFromDetails !== undefined
      ? Number(totalFromDetails)
      : totalFromOrder !== undefined
        ? Number(totalFromOrder)
        : subtotal + fallbackTax;

  const tax =
    trxData?.tax !== undefined
      ? Number(trxData.tax)
      : items.length > 0
        ? Math.max(0, total - subtotal)
        : fallbackTax;

  const cashReceive =
    trxData?.payment_details?.cashReceive !== undefined
      ? Number(trxData.payment_details.cashReceive)
      : null;
  const change =
    trxData?.payment_details?.change !== undefined
      ? Number(trxData.payment_details.change)
      : null;

  return (
    <div className="max-w-md mx-auto my-6 space-y-4 print:my-0 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/transaction")}
        >
          Back
        </Button>
        <Button type="button" onClick={handlePrint} size="sm">
          Print Struk
        </Button>
      </div>

      <Card className="p-6 font-mono text-xs text-black bg-white border shadow-none border-border/80 print:border-none">
        <CardHeader className="p-0 pb-4 text-center border-b border-dashed border-zinc-400">
          <CardTitle className="text-base font-bold tracking-wider uppercase">
            {storeSettings.storeName}
          </CardTitle>
          {storeSettings.storeAddress && (
            <p className="text-[11px] text-zinc-600">
              {storeSettings.storeAddress}
            </p>
          )}
          <p className="text-[11px] text-zinc-500 mt-1">
            {new Date().toLocaleString("id-ID")}
          </p>
          {storeSettings.receiptHeader && (
            <p className="text-[11px] text-zinc-700 mt-1.5">
              {storeSettings.receiptHeader}
            </p>
          )}
        </CardHeader>

        <CardContent className="p-0 pt-3 space-y-3">
          {loading ? (
            <p className="py-4 text-center text-zinc-500">Memuat struk...</p>
          ) : !trxData ? (
            <p className="py-4 text-center text-zinc-500">
              Data transaksi tidak ditemukan.
            </p>
          ) : (
            <>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-start justify-between">
                  <span>Order Number</span>
                  <span className="font-semibold uppercase">{orderNumber}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span>Payment Method</span>
                  <span className="uppercase">{paymentMethod}</span>
                </div>
                {effectiveStatus && (
                  <div className="flex items-start justify-between">
                    <span>Status</span>
                    <span className="uppercase">{effectiveStatus}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-2 border-t border-dashed border-zinc-400">
                {items.map((it, idx) => {
                  const name =
                    it.nama ??
                    it.product?.nama ??
                    it.name ??
                    `Item #${it.productId ?? it.product_id ?? idx + 1}`;
                  const qty = Number(it.quantity ?? it.qty ?? 1);
                  const price = Number(it.unitPrice ?? it.price ?? 0);
                  const lineSub = Number(it.subtotal ?? qty * price);

                  return (
                    <div
                      key={it.id ?? `${it.productId ?? it.product_id ?? idx}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="font-semibold truncate">{name}</div>
                      <div className="text-[11px] text-zinc-600 shrink-0">
                        {qty} x {formatIDR(price)}
                      </div>
                      <div className="font-medium shrink-0">
                        {formatIDR(lineSub)}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 space-y-1 border-t border-dashed border-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%)</span>
                    <span>{formatIDR(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatIDR(total)}</span>
                  </div>
                  {paymentMethod === "CASH" && cashReceive !== null && (
                    <>
                      <div className="flex justify-between">
                        <span>Pay</span>
                        <span>{formatIDR(cashReceive)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change</span>
                        <span>{formatIDR(change ?? 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-zinc-400">
                <p className="font-semibold">{storeSettings.receiptFooter}</p>
                {storeSettings.receiptSubFooter && (
                  <p className="text-[10px] text-zinc-500">
                    {storeSettings.receiptSubFooter}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintTransaction;