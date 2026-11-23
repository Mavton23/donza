import { HelpCenter } from '@/components/help/help-center';
export const metadata = { title: 'Centro de ajuda', description: 'Respostas às perguntas mais comuns sobre a Donza.' };
export default function Page() {
  return <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><header className="mb-8 text-center"><h1 className="text-3xl font-bold tracking-tight">Centro de ajuda</h1><p className="mt-2 text-muted-foreground">Encontre respostas ou fale com a nossa equipa.</p></header><HelpCenter /></div>;
}
