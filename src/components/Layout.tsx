import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Navigation />
        <main className="flex-1 md:ml-0 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;