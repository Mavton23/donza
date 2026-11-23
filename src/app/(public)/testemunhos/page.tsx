import { Testimonials } from './testimonials';
export const metadata = { title: 'Testemunhos', description: 'O que dizem sobre a Donza.' };
export default function Page() { return <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><header className="mb-8 text-center"><h1 className="text-3xl font-bold tracking-tight">O que dizem sobre a Donza</h1><p className="mt-2 text-muted-foreground">Experiências de quem aprende e ensina na plataforma.</p></header><Testimonials /></div>; }
