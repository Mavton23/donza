'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/auth-provider';
import { displayName } from '@/lib/format';
import { ROLE_LABEL } from '@/lib/utils';

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;
  const name = displayName(user);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40" aria-label="Menu da conta">
        <Avatar src={user.avatarUrl} name={name} size={36} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="font-normal">{ROLE_LABEL[user.role]} · @{user.username}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/painel"><LayoutDashboard />Painel</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href={`/utilizadores/${user.username}`}><UserIcon />O meu perfil</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/definicoes"><Settings />Definições</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={async () => { await logout(); router.push('/'); }}><LogOut />Terminar sessão</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
