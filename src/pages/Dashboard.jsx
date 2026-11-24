import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart.jsx";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DollarSign, Receipt, Package, Wallet, BarChart3 } from "lucide-react";
import api from "../services/api.js";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
};

const formatIDR = (val) =>
  Number(val || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });

const formatCompactIDR = (val) => {
  const num = Number(val || 0);
  if (num === 0) return "Rp 0";
  if (Math.abs(num) >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (Math.abs(num) >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  }
  if (Math.abs(num) >= 1_000) {
    return `Rp ${(num / 1_000).toFixed(0)}rb`;
  }
  return formatIDR(num);
};

const useCountUp = (targetValue, enabled = true, duration = 650) => {
  const [value, setValue] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const from = prevRef.current;
    const to = Number(targetValue || 0);
    if (from === to) {
      setValue(to);
      return;
    }

    let rafId;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setValue(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
        setValue(to);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [targetValue, enabled, duration]);

  return Math.round(value);
};

const AnimatedCurrencyStat = ({ value, loading }) => {
  const animated = useCountUp(value, !loading);
  if (loading) return <>...</>;
  return <span className="tabular-nums">{formatIDR(animated)}</span>;
};

const AnimatedNumberStat = ({ value, loading }) => {
  const animated = useCountUp(value, !loading, 500);
  if (loading) return <>...</>;
  return <span className="tabular-nums">{animated}</span>;
};

const extractList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.transactions)) return res.transactions;
  if (Array.isArray(res?.products)) return res.products;
  return [];
};

const parseOrderDate = (orderNumber) => {
  if (!orderNumber) return null;
  const match = String(orderNumber).match(/(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, yyyy, mm, dd] = match;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

const getTrxDate = (trx) => {
  const raw =
    trx.created_at ??
    trx.createdAt ??
    trx.tanggal ??
    trx.updated_at ??
    trx.updatedAt ??
    trx.date;
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return parseOrderDate(trx.order_number ?? trx.orderNumber);
};

const getTrxTotal = (trx) =>
  Number(
    trx.total ??
      trx.totalAmount ??
      trx.total_amount ??
      trx.grandTotal ??
      trx.grand_total ??
      trx.amount ??
      0,
  );

const isPaidTrx = (trx) => {
  const st = String(
    trx.status ?? trx.paymentStatus ?? trx.payment_status ?? "PAID",
  )
    .trim()
    .toUpperCase();
  return (
    st === "PAID" ||
    st === "SUCCESS" ||
    st === "SETTLEMENT" ||
    st === "COMPLETED"
  );
};

const isSameLocalDay = (dateInput, refDate = new Date()) => {
  if (!dateInput) return false;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === refDate.getFullYear() &&
    d.getMonth() === refDate.getMonth() &&
    d.getDate() === refDate.getDate()
  );
};

const startOfWeekMonday = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const buildChartSeries = (paidTransactions, period) => {
  const now = new Date();
  const buckets = [];

  if (period === "daily") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
        label: d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
        sales: 0,
        count: 0,
        match: (trxDate) => isSameLocalDay(trxDate, d),
      });
    }
  } else if (period === "weekly") {
    const currentWeekStart = startOfWeekMonday(now);
    for (let i = 5; i >= 0; i--) {
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      buckets.push({
        key: start.toISOString(),
        label: start.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        }),
        sales: 0,
        count: 0,
        match: (trxDate) => {
          const t = new Date(
            trxDate.getFullYear(),
            trxDate.getMonth(),
            trxDate.getDate(),
          ).getTime();
          return t >= start.getTime() && t < end.getTime();
        },
      });
    }
  } else if (period === "monthly") {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        sales: 0,
        count: 0,
        match: (trxDate) =>
          trxDate.getFullYear() === d.getFullYear() &&
          trxDate.getMonth() === d.getMonth(),
      });
    }
  } else {
    for (let i = 4; i >= 0; i--) {
      const yr = now.getFullYear() - i;
      buckets.push({
        key: String(yr),
        label: String(yr),
        sales: 0,
        count: 0,
        match: (trxDate) => trxDate.getFullYear() === yr,
      });
    }
  }

  for (const trx of paidTransactions) {
    const trxDate = getTrxDate(trx);
    if (!trxDate || Number.isNaN(trxDate.getTime())) continue;
    const found = buckets.find((b) => b.match(trxDate));
    if (found) {
      found.sales += getTrxTotal(trx);
      found.count += 1;
    }
  }

  return buckets;
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    let active = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [trxRes, prodRes] = await Promise.allSettled([
          api.get("/transaction"),
          api.get("/product"),
        ]);

        if (!active) return;

        if (trxRes.status === "fulfilled") {
          setTransactions(extractList(trxRes.value));
        }
        if (prodRes.status === "fulfilled") {
          setProducts(extractList(prodRes.value));
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboardData();
    return () => {
      active = false;
    };
  }, []);

  const paidTransactions = useMemo(
    () => transactions.filter(isPaidTrx),
    [transactions],
  );

  const stats = useMemo(() => {
    const today = new Date();

    const todaySales = paidTransactions
      .filter((trx) => isSameLocalDay(getTrxDate(trx), today))
      .reduce((sum, trx) => sum + getTrxTotal(trx), 0);

    const totalSales = paidTransactions.reduce(
      (sum, trx) => sum + getTrxTotal(trx),
      0,
    );

    const activeProductsCount = products.filter((p) => {
      const active =
        p.is_active !== undefined
          ? Boolean(Number(p.is_active))
          : p.isActive !== undefined
            ? Boolean(p.isActive)
            : true;
      return active && Number(p.stock ?? 0) > 0;
    }).length;

    return {
      todaySales,
      totalSales,
      totalTransactions: transactions.length,
      activeProductsCount,
    };
  }, [paidTransactions, products, transactions.length]);

  const chartData = useMemo(
    () => buildChartSeries(paidTransactions, period),
    [paidTransactions, period],
  );

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = new Date(getTrxDate(a) ?? 0).getTime();
        const dateB = new Date(getTrxDate(b) ?? 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="max-w-6xl p-6 sm:p-8 mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">POS Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Welcome to Warung Madara Dashboard
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 rounded-md shadow-md border-border">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
              <CardTitle className="text-sm font-medium">Today Sales</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-2xl font-bold">
                <AnimatedCurrencyStat value={stats.todaySales} loading={loading} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Valid revenue for today
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 rounded-md shadow-md border-border">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-2xl font-bold">
                <AnimatedCurrencyStat value={stats.totalSales} loading={loading} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Cumulative paid transactions
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 rounded-md shadow-md border-border">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <Receipt className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-2xl font-bold">
                <AnimatedNumberStat
                  value={stats.totalTransactions}
                  loading={loading}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total orders recorded
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 rounded-md shadow-md border-border">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Products
              </CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-2xl font-bold">
                <AnimatedNumberStat
                  value={stats.activeProductsCount}
                  loading={loading}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Active products with stock
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="p-6 rounded-md shadow-md border-border">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-0 pb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">
                Sales Overview
              </CardTitle>
            </div>

            <div className="inline-flex p-1 rounded-md bg-muted w-fit">
              {PERIODS.map((p) => {
                const active = period === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPeriod(p.key)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                Loading chart...
              </div>
            ) : (
              <ChartContainer
                key={period}
                config={chartConfig}
                className="h-64 w-full"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 16, right: 12, left: 0, bottom: 4 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={64}
                    tickFormatter={(val) => formatCompactIDR(val)}
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value, _name, item) => (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold">
                              {formatIDR(value)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item?.payload?.count ?? 0} paid transactions
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="sales"
                    fill="var(--color-sales)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="p-6 rounded-md shadow-md border-border">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase border-y bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium text-center">#</th>
                  <th className="px-4 py-3 font-medium text-center">Order No</th>
                  <th className="px-4 py-3 font-medium text-center">Method</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions.map((trx, index) => {
                    const statusRaw = String(
                      trx.status ?? trx.payment_status ?? "PAID",
                    ).toUpperCase();
                    const isPaid =
                      statusRaw === "PAID" || statusRaw === "SUCCESS";
                    const totalVal = getTrxTotal(trx);

                    return (
                      <tr
                        key={trx.id ?? index}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-center whitespace-nowrap">
                          {trx.order_number ?? trx.orderNumber ?? `#${trx.id}`}
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {trx.payment_method ?? trx.paymentMethod ?? "-"}
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            }`}
                          >
                            {statusRaw}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-center whitespace-nowrap">
                          {formatIDR(totalVal)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;