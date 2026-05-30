import { Layout } from "@/components/layout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Home } from "@/pages/home";
import { Products } from "@/pages/products";
import { ProductDetail } from "@/pages/product-detail";
import { Cart } from "@/pages/cart";
import { Checkout } from "@/pages/checkout";
import { CheckoutSuccess } from "@/pages/checkout-success";
import { Orders } from "@/pages/orders";
import { OrderDetail } from "@/pages/order-detail";
import { Admin } from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LangProvider } from "@/lib/i18n";
import { SoftLaunchGate } from "@/components/soft-launch-gate";
import { SettingsProvider } from "@/lib/settings-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/orders" component={Orders} />
        <Route path="/orders/:id" component={OrderDetail} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LangProvider>
          <SettingsProvider>
            <SoftLaunchGate>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppRouter />
              </WouterRouter>
              <Toaster />
            </SoftLaunchGate>
          </SettingsProvider>
        </LangProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
