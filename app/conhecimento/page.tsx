import type {Metadata} from 'next';
import KnowledgePortal from '../../components/knowledge-portal';
export const metadata:Metadata={title:'Acervo chAI | Sua caixa de conhecimento',description:'Portal privado de materiais, referências e aprendizados da chAI.',robots:{index:false,follow:false}};
export default function Page(){return <KnowledgePortal/>;}
