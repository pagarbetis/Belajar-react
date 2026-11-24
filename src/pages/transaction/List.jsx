import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "../../services/api.js";

const ListTransaction = () => {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const fetchTransaction = async () => {
    try {
      const response = await api.get("/transaction");
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setTransaction(list);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, []);

  const syncOrderAfterSnap = async (trx, snapResult) => {
    const orderNum = trx?.order_number ?? snapResult?.order_id;
    const txStatus = snapResult?.transaction_status || "settlement";
    if (!orderNum) return;

    try {
      await api.get(
        `/transaction/sync-status?order_id=${encodeURIComponent(orderNum)}&transaction_status=${encodeURIComponent(txStatus)}`,
      );
    } catch {
      // Abaikan jika endpoint sync tidak tersedia; fetchTransaction tetap dijalankan
    }
  };

  const handlePrintRow = (trx) => {
    sessionStorage.setItem("last_transaction", JSON.stringify(trx));
    navigate(
      `/transaction/print?order_id=${encodeURIComponent(trx.order_number ?? trx.id)}`,
      {
        state: { transaction: trx },
      },
    );
  };

  const handleContinuePayment = async (trx) => {
    try {
      setBusyId(trx.id);
      const res = await api.post(`/transaction/${trx.id}/continue`, {});
      const payload = res?.data ?? res;
      const snapToken = payload?.payment_gateway?.token;
      const redirectUrl = payload?.payment_gateway?.redirect_url;

      if (snapToken && window.snap?.pay) {
        window.snap.pay(snapToken, {
          onSuccess: async (result) => {
            await syncOrderAfterSnap(trx, result);
            await fetchTransaction();
            Swal.fire({
              icon: "success",
              title: "Payment Success",
              text: "Transaction has been paid.",
              timer: 1400,
              showConfirmButton: false,
            });
          },
          onPending: async () => {
            await fetchTransaction();
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "Payment Failed",
              text: "Unable to complete payment.",
            });
          },
          onClose: async () => {
            await fetchTransaction();
          },
        });
        return;
      }

      if (redirectUrl) {
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
        await fetchTransaction();
        return;
      }

      await fetchTransaction();
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: payload?.message || "Transaction updated.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Failed to continue payment",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Transaction?",
      text: "Are you sure you want to delete this transaction?",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setBusyId(id);
      await api.delete(`/transaction/${id}`);
      await fetchTransaction();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Transaction has been deleted.",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log(error.message);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error?.response?.data?.message ||
          error.message ||
          "Failed to delete transaction.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="p-6 border-0 rounded-md shadow-md border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <div>
          <CardTitle className="text-xl font-bold">Data Transaction</CardTitle>
        </div>
        <Button
          className="rounded-md"
          onClick={() => navigate("/transaction/create")}
        >
          Create New transaction
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium text-center">#</th>
              <th className="px-4 py-3 font-medium text-left">Order number</th>
              <th className="px-4 py-3 font-medium text-center">Payment method</th>
              <th className="px-4 py-3 font-medium text-center">Product</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transaction.map((trx, index) => {
              const statusUpper = String(trx.status || "PENDING").toUpperCase();
              const isPaid = ["PAID", "SUCCESS", "SETTLEMENT"].includes(
                statusUpper,
              );
              const isPending = statusUpper === "PENDING";
              const isRowBusy = busyId === trx.id;

              return (
                <tr
                  key={trx.id ?? trx.order_number ?? index}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-left whitespace-nowrap">
                    {trx.order_number}
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    {trx.payment_method}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ul className="space-y-0.5">
                      {(trx.items || []).map((item, itemIdx) => (
                        <li
                          key={item.id ?? `${item.product_id ?? "item"}-${itemIdx}`}
                          className="text-sm"
                        >
                          {item.nama ?? item.product?.nama ?? "-"}
                          {item.qty ? ` (x${item.qty})` : ""}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          : isPending
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      }`}
                    >
                      {statusUpper}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {isPending ? (
                        <Button
                          type="button"
                          disabled={isRowBusy}
                          onClick={() => handleContinuePayment(trx)}
                          size="sm"
                          className="text-white bg-amber-600 rounded-md hover:bg-amber-700"
                        >
                          {isRowBusy ? "Processing..." : "Payment"}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={isRowBusy}
                          onClick={() => handlePrintRow(trx)}
                          size="sm"
                          className="text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                          Print
                        </Button>
                      )}
                      <Button
                        type="button"
                        disabled={isRowBusy}
                        onClick={() => handleDelete(trx.id)}
                        size="sm"
                        className="text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default ListTransaction;