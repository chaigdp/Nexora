export const phases=['Descoberta','Configuração','Migração','Testes','Treinamento','Entrada em operação','Acompanhamento','Concluída'];
export type Project={id:string;client:string;segment:string;system:string;owner:string;phase:string;start:string;due:string;completed:string;scope:string;risk:string};
export type Task={id:string;project:string;title:string;owner:string;due:string;done:number;critical:number;kind:string;priority?:string;dependency?:string;blocked?:number};
export type Event={id:string;project:string;message:string;created:string};
export type State={name:string;demo:boolean;expires:number;projects:Project[];tasks:Task[];events:Event[]};
