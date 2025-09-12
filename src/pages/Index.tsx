import Dashboard from "@/components/Dashboard";
import Layout from "@/components/Layout";
import PixelArtWidget from "@/components/PixelArtWidget";

const Index = () => {
  return (
    <Layout>
      <div className="p-6">
        <PixelArtWidget />
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;
