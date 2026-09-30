import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Nexora | Gestão de implantações',description:'Sua carteira de implantações, entregas, pendências e resultados.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
