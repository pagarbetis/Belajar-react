import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Receipt, RotateCcw, Save } from "lucide-react";

const STORAGE_KEY = "warung_madara_settings";

const DEFAULT_SETTINGS = {
    storeName: "Warung Madara",
    storeAddress: "",
    defaultTax: 0,
    receiptHeader: "Thank you for your purchase!",
    receiptFooter: "Please keep this receipt as proof of payment.",
    autoPrintReceipt: false,
};

const SettingsPage = () => {
    const [form, setForm] = useState(DEFAULT_SETTINGS);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setForm({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
            }
        } catch (err) {
            console.log(err.message);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : name === "defaultTax"
                        ? Number(value)
                        : value,
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        Swal.fire({
            icon: "success",
            title: "Saved",
            text: "Store settings have been saved.",
            timer: 1400,
            showConfirmButton: false,
        });
    };

    const handleReset = () => {
        setForm(DEFAULT_SETTINGS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        Swal.fire({
            icon: "info",
            title: "Reset",
            text: "Settings restored to default.",
            timer: 1300,
            showConfirmButton: false,
        });
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <main className="max-w-4xl p-6 sm:p-8 mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-sm text-muted-foreground">
                        Configure store profile, default tax, and receipt preferences
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <Card className="p-6 rounded-md shadow-md border-border">
                        <CardHeader className="p-0 pb-4">
                            <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-base font-semibold">
                                    Store Profile
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Basic store details displayed across the POS and receipt
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Store Name</label>
                                <input
                                    type="text"
                                    name="storeName"
                                    value={form.storeName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-background border-input"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Store Address</label>
                                <input
                                    type="text"
                                    name="storeAddress"
                                    value={form.storeAddress}
                                    onChange={handleChange}
                                    placeholder="e.g. Jl. Ciganjur Raya No. 10, South Jakarta"
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-background border-input"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Default Tax (%)</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.5"
                                    name="defaultTax"
                                    value={form.defaultTax}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            defaultTax: e.target.value,
                                        }))
                                    }
                                    className="w-full max-w-xs px-3 py-2 text-sm border rounded-md bg-background border-input"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="p-6 rounded-md shadow-md border-border">
                        <CardHeader className="p-0 pb-4">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-base font-semibold">
                                    Receipt Settings
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Header, footer, and print behavior for customer receipts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Receipt Header</label>
                                <input
                                    type="text"
                                    name="receiptHeader"
                                    value={form.receiptHeader}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-background border-input"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Receipt Footer</label>
                                <input
                                    type="text"
                                    name="receiptFooter"
                                    value={form.receiptFooter}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-background border-input"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none pt-1">
                                <input
                                    type="checkbox"
                                    name="autoPrintReceipt"
                                    checked={form.autoPrintReceipt}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-input"
                                />
                                <span>Open print view automatically after successful checkout</span>
                            </label>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset Default
                        </Button>
                        <Button type="submit" className="gap-2">
                            <Save className="w-4 h-4" />
                            Save Settings
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SettingsPage;