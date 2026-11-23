'use client';
import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(function PasswordInput({ className, ...props }, ref) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? 'text' : 'password'} className={`pr-11 ${className ?? ''}`} {...props} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:text-foreground">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
