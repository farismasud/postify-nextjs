import { AppProps } from "next/app";
import Layout from "@/components/ui/layout/layout";
import ProtectedRoute from "@/lib/ProtectedRoute";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <ProtectedRoute>
        <Component {...pageProps} />
      </ProtectedRoute>
    </Layout>
  );
}

export default MyApp;
