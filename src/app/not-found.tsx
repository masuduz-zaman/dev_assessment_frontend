import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="gradient-text animate-float text-8xl font-black">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mb-6 mt-2 text-slate-500">The page you are looking for moved or never existed.</p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </div>
  );
}
