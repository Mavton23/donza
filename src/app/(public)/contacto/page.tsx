import Link from 'next/link';
import { ContactForm } from './contact-form';
export const metadata = { title: 'Contacto', description: 'Fale com a equipa da Donza.' };
export default function Page() {
  return <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><header className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Fale connosco</h1><p className="mt-2 text-muted-foreground">Respondemos o mais depressa possível. Veja também o <Link href="/ajuda" className="font-medium text-primary hover:underline">centro de ajuda</Link>.</p></header><ContactForm /></div>;
}
