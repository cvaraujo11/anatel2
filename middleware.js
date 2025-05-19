import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if needed
  await supabase.auth.getSession();
  
  // Exemplo: proteger rotas específicas
  // const {data: {session}} = await supabase.auth.getSession();
  // if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', req.url));
  // }
  
  return res;
}

export const config = {
  matcher: [
    // Especificar quais rotas o middleware deve processar
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 