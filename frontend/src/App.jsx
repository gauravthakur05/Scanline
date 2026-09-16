import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import Landing from "./pages/Landing.jsx";
import Analyzer from "./pages/Analyzer.jsx";
import Results from "./pages/Results.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyze" element={<Analyzer />} />
          <Route path="/results" element={<Results />} />
          <Route path="/how-it-works" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}

function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink-soft">The page you're looking for doesn't exist.</p>
    </div>
  );
}
