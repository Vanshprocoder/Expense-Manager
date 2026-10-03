import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import ShopPage from "./pages/Shop";
import PersonalPage from "./pages/Personal";
import HomePage from "./pages/Home";
import BalancesPage from "./pages/Balances";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/personal" element={<PersonalPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/balances" element={<BalancesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
