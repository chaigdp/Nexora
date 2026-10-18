export const chaiModules = {
  trabalho: {label:'Copiloto de trabalho',eyebrow:'chAI · Rotina e evolução',intro:'Conecta passagens comerciais, incidentes, reuniões e evidências para apoiar sua próxima decisão.',placeholder:'O que preciso resolver primeiro?',suggestions:['Organize minhas três prioridades de hoje','Revise lacunas da passagem comercial','Prepare meu resumo semanal com evidências','Como evoluir minha autonomia nos próximos 30 dias?']},
  inicio: {
    label: 'Visão executiva',
    eyebrow: 'chAI · Centro de comando',
    intro: 'Prioriza a carteira, explica o que pede atenção e transforma dados em próximos passos.',
    placeholder: 'Ex.: O que precisa da minha atenção hoje?',
    suggestions: ['O que devo priorizar hoje?','Resuma a carteira em 5 pontos','Quais clientes exigem ação agora?','Onde estão os maiores gargalos?']
  },
  implantacoes: {
    label: 'Copiloto de implantação',
    eyebrow: 'chAI · Implantação',
    intro: 'Analisa etapas, prazos, bloqueios e dependências para orientar a próxima decisão.',
    placeholder: 'Ex.: O que está travando esta implantação?',
    suggestions: ['O que falta na passagem de bastão?','Como melhorar a adoção deste cliente?','Monte um plano de reversão em 7 dias','O que falta para a saída da implantação?']
  },
  cs: {
    label: 'Parceira de Customer Success',
    eyebrow: 'chAI · Sucesso do cliente',
    intro: 'Conecta saúde, feedbacks, pendências e planos para apoiar retenção, adoção e expansão.',
    placeholder: 'Ex.: Como melhorar a saúde deste cliente?',
    suggestions: ['Analise este cliente em 360°','Monte um plano para os próximos 7 dias','O que está faltando registrar?','Sugira uma mensagem executiva']
  },
  feedbacks: {
    label: 'Analista da voz do cliente',
    eyebrow: 'chAI · Feedbacks',
    intro: 'Interpreta avaliações e comentários, identifica padrões e ajuda a preparar respostas.',
    placeholder: 'Ex.: O que os feedbacks estão mostrando?',
    suggestions: ['Quais padrões aparecem nos feedbacks?','Quem demonstra maior insatisfação?','Quais causas merecem investigação?','Sugira uma resposta empática']
  },
  riscos: {
    label: 'Estrategista de riscos',
    eyebrow: 'chAI · Riscos e estratégias',
    intro: 'Relaciona causa, impacto e evidências para propor contenção, recuperação e critério de saída.',
    placeholder: 'Ex.: Qual estratégia é mais indicada para este risco?',
    suggestions: ['Quais riscos exigem ação imediata?','Explique as principais causas','Sugira uma estratégia de contenção','Defina um critério de recuperação']
  },
  testes: {
    label: 'Copiloto de qualidade',
    eyebrow: 'chAI · Testes',
    intro: 'Lê evidências, cenários e reprovações para apontar lacunas antes da liberação.',
    placeholder: 'Ex.: O que ainda falta validar antes de aprovar?',
    suggestions: ['O que ainda falta testar?','Quais reprovações são mais críticas?','Sugira cenários adicionais','Há risco de liberar como está?']
  },
  rentabilidade: {
    label: 'Analista de valor',
    eyebrow: 'chAI · Rentabilidade',
    intro: 'Relaciona receita, esforço operacional, risco e oportunidade para apoiar decisões de carteira.',
    placeholder: 'Ex.: Onde o esforço parece alto para o retorno?',
    suggestions: ['Quais contas consomem mais esforço?','Onde há baixa rentabilidade?','Quais clientes têm oportunidade de expansão?','Resuma esforço x retorno da carteira']
  }
} as const;

export type ChaiModule = keyof typeof chaiModules;

export const chaiModuleLabels:Record<ChaiModule,string>={
  trabalho:'Espaço de trabalho',
  inicio:'Início / visão geral',
  implantacoes:'Implantações',
  cs:'Acompanhamento de CS',
  feedbacks:'Feedbacks',
  riscos:'Riscos e estratégias',
  testes:'Testes',
  rentabilidade:'Rentabilidade'
};

