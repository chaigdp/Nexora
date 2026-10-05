import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={
  title:'Vectta | Portal de implementação · chAI',
  description:'Gestão de onboarding e implementação de clientes no ecossistema chAI.',
  icons:{icon:'/favicon.svg'},
  robots:{index:false,follow:false}
};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
