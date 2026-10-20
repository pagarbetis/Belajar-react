import { useEffect, useState } from "react";
// import AppModal from "../../components/AppModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "../../services/api.js";
import { Select } from "@/components/ui/select";
import { SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { CardFooter } from "react-bootstrap";

const FormTransaction = () => {
    const _initForm = {
        id: null,
        name: "",
        email: "",
        password: "",
        is_active: 1,
    };
    
  const [product, setProduct] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProduct = async () => {
    try {
      const response = await api.get("/product");
      setProduct(response.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const addToChart = (product) => {
    setCart((prev) => {
      const ext = prev.find((item) => item.id === product.id);
      if (ext) {
        if (ext.qty >= product.stock) return prev;
        return prev.map((item) => {
          return item.id === product.id ? { ...item, qty: item.qty + 1 } : item;
        });
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, qty) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + qty;
            return nextQty > 0 && nextQty <= item.stock
              ? { ...item, qty: nextQty }
              : item;
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  };

  return (
    <>
      <div className="grid items-start gap-6 grid-col-1 lg:grid-cols-12">
        <div className="space-y-4 shadow-md lg:col-span-7">
          <Card className="p-6 border-0 rounded-md shadow-md border-border">
            <CardHeader className="px-5 py-4 border-b">
              <CardTitle className="text-sm font-semibold">
                Available Product
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2  gap-4 p-4 overflow-y-auto md:grid-cols-3 max-h-[620px]">
              {product.map((item) => (
                <button
                  onClick={() => addToChart(item)}
                  key={item.id}
                  className="flex flex-col justify-between p-3.5 rounded-lg border border-border/80 bg-card hover:border-primary/60 hover:shadow-md text-left transition-all group"
                >
                  <div>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {item.category_name}
                    </span>
                    <h4 className="mt-0.5 group-hover:text-primary text-sm font-semibold line-clamp-1">
                      {item.nama}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium">
                      {Number(item.price).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "iDR",
                      })}
                    </span>
                    <span className="text-[11px} text-muted-foreground">
                      {item.stock}
                    </span>
                  </div>
                </button>
              ))}
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
                  <div key={item.id}>
                    <div className="flex items-center justify-between pt-5 text-sm">
                      <div className="flex-1 pr-2">
                        <p className="text-sm font-medium">{item.nama}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {Number(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
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
                        onClick={() => updateQty(item.id, 1)}
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0 text-xs rounded-md hover:shadow-md"
                      >
                        +
                      </Button>
                      <Button
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
                  <SelectTrigger
                    id="payment"
                    className="w-40 h-8 text-xs shadow-sm"
                  >
                    <SelectValue>Select One</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Qris">Qris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pay</Label>
                <Input
                  className="h-8 text-xs rounded-md shadow-sm"
                  id="cash"
                  type="number"
                  placeholder="Enter your cash"
                  size="sm"
                ></Input>
              </div>
              <div className="space-y-1.5 pt-3 border-t text-xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Total</span>
                  <span>Rp.100.000</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Change</span>
                  <span>Rp.100.000</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <Button className="w-full text-xs font-semibold shadow-sm">
                Save Transaction
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}

export default FormTransaction;
