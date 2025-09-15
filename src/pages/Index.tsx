import Dashboard from "@/components/Dashboard";
import Layout from "@/components/Layout";
import DescriptionPanel from "@/components/DescriptionPanel";

const Index = () => {
  return (
    <Layout>
      <DescriptionPanel />
      <div className="p-6">
        <Dashboard />
      </div>
    </Layout>
  );
};

export default Index;