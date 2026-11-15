import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container-page min-h-[70vh] py-10">{children}</main>
      <Footer />
    </>
  );
}
