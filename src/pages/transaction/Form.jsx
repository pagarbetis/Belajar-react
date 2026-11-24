import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";

const SETTINGS_KEY = "warung_madara_settings";
const DEFAULT_TAX_RATE = 10;

const getStoredTaxRate = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_TAX_RATE;
    const parsed = JSON.parse(raw);
    const rate = Number(parsed?.defaultTax);
    return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_TAX_RATE;
  } catch {
    return DEFAULT_TAX_RATE;
  }
};

const formatIDR = (val) =>
  Number(val || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

const isProductAvailable = (itemProduct) => {
  const active =
    itemProduct.is_active !== undefined
      ? Boolean(Number(itemProduct.is_active))
      : itemProduct.isActive !== undefined
        ? Boolean(itemProduct.isActive)
        : true;
  const stock = Number(itemProduct.stock ?? 0);
  return active && stock > 0;
};

const FormTransaction = () => {
  const navigate = useNavigate();

  const [taxRate, setTaxRate] = useState(() => getStoredTaxRate());
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncTax = () => {
      setTaxRate(getStoredTaxRate());
    };

    syncTax();
    window.addEventListener("warung_madara_settings_updated", syncTax);
    window.addEventListener("storage", syncTax);
    return () => {
      window.removeEventListener("warung_madara_settings_updated", syncTax);
      window.removeEventListener("storage", syncTax);
    };
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await api.get("/product");
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setProducts(list);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const addToCart = (itemProduct) => {
    const maxStock = Number(itemProduct.stock ?? 0);
    if (!isProductAvailable(itemProduct)) return;

    setCart((prev) => {
      const ext = prev.find((item) => item.id === itemProduct.id);
      if (ext) {
        if (ext.qty >= maxStock) return prev;
        return prev.map((item) =>
          item.id === itemProduct.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prev, { ...itemProduct, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            const maxStock = Number(item.stock ?? nextQty);
            if (nextQty > 0 && nextQty <= maxStock) {
              return { ...item, qty: nextQty };
            }
          }
          return item;
        })
        .filter((item) => item.qty > 0),
    );
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.qty),
    0,
  );
  const tax = Math.round(subtotal * (Number(taxRate || 0) / 100));
  const total = subtotal + tax;

  const cashNum = Number(cashAmount || 0);
  const change =
    paymentMethod === "cash" && cashNum > total ? cashNum - total : 0;

  const handleCheckout = async () => {
    if (loading) return;

    if (cart.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Keranjang Kosong",
        text: "Pilih produk dulu sebelum nyimpen transaksi.",
      });
      return;
    }

    if (paymentMethod === "cash" && cashNum < total) {
      await Swal.fire({
        icon: "warning",
        title: "Uang Kurang",
        text: "Nominal bayar cash masih kurang dari total.",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        paymentMethod: paymentMethod === "cash" ? "CASH" : "QRIS",
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: Number(item.price),
        })),
        tax,
        pay: paymentMethod === "cash" ? cashNum : 0,
      };

      const result = await api.post("/transaction", payload);

      const isSuccess = result?.status === true || result?.success === true;

      if (!isSuccess) {
        await Swal.fire({
          icon: "error",
          title: "Transaksi Gagal",
          text: result?.message || "Failed process transaction",
        });
        return;
      }

      if (paymentMethod === "qris" && result.payment_gateway?.redirect_url) {
        window.location.href = result.payment_gateway.redirect_url;
        return;
      }

      const printPayload = {
        ...result,
        payment_method:
          result.payment_method ?? (paymentMethod === "cash" ? "CASH" : "QRIS"),
        items:
          Array.isArray(result.items) && result.items.length > 0
            ? result.items
            : cart.map((item) => ({
                product_id: item.id,
                nama: item.nama,
                qty: item.qty,
                price: Number(item.price),
                subtotal: Number(item.price) * Number(item.qty),
              })),
        subtotal: result.subtotal ?? subtotal,
        tax: result.tax ?? tax,
        total: result.total ?? total,
      };

      await Swal.fire({
        icon: "success",
        title: "Transaksi Berhasil!",
        text: `Order ${result.order_number ?? ""} tersimpan.`,
        timer: 1000,
        showConfirmButton: false,
      });

      navigate("/transaction/print", {
        state: { transaction: printPayload },
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Error transaction order";
      await Swal.fire({
        icon: "error",
        title: "Transaksi Gagal",
        text: msg,
      });
      console.log("error transaction order", error);
    } finally {
      setLoading(false);
    }
  };

  const availableProducts = products.filter(isProductAvailable);

  return (
    <div className="grid items-start gap-6 grid-cols-1 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7">
        <Card className="p-6 border-0 rounded-md shadow-md border-border">
          <CardHeader className="px-5 py-4 border-b">
            <CardTitle className="text-sm font-semibold">
              Available Product
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 p-4 overflow-y-auto md:grid-cols-3 max-h-[620px]">
            {availableProducts.length > 0 ? (
              availableProducts.map((item) => (
                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  key={item.id}
                  className="flex flex-col justify-between p-3.5 rounded-lg border border-border/80 bg-card hover:border-primary/60 hover:shadow-md text-left transition-all group"
                >
                  <div>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {item.category_name ?? item.category?.name ?? ""}
                    </span>
                    <h4 className="mt-0.5 group-hover:text-primary text-sm font-semibold line-clamp-1">
                      {item.nama}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between w-full mt-2">
                    <span className="text-xs font-medium">
                      {formatIDR(item.price)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {item.stock}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="col-span-full py-6 text-xs text-center text-muted-foreground">
                No available product
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <Card className="border rounded-md shadow-md border-border/80">
          <CardHeader className="px-5 py-4 border-b">
            <CardTitle className="text-sm font-semibold">
              Summary Cart
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3 overflow-y-auto divide-y divide-border/60">
              {cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1 pr-2">
                      <p className="text-sm font-medium">{item.nama}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatIDR(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0 text-xs rounded-md hover:shadow-md"
                    >
                      -
                    </Button>
                    <span className="w-6 font-mono text-xs font-medium text-center">
                      {item.qty}
                    </span>
                    <Button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0 text-xs rounded-md hover:shadow-md"
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="w-6 h-6 p-0 text-xs rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:shadow-md"
                    >
                      x
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment" className="w-40 h-8 text-xs shadow-sm">
                  <SelectValue placeholder="Select One" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="qris">Qris</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-1">
                <Label className="text-xs">Pay</Label>
                <Input
                  className="h-8 text-xs rounded-md shadow-sm"
                  id="cash"
                  type="number"
                  placeholder="Enter your cash"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5 pt-3 border-t text-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Tax ({taxRate}%)</span>
                <span>{formatIDR(tax)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Total</span>
                <span>{formatIDR(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Change</span>
                <span>{formatIDR(change)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <Button
              type="button"
              disabled={loading}
              className="w-full text-xs font-semibold shadow-sm"
              onClick={handleCheckout}
            >
              {loading ? "Loading..." : "Save Transaction"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FormTransaction;