// Monta os dados completos do paciente (pessoais + anamnese) para exibição.
// Em produção viria da ficha/anamnese salva; aqui usamos os campos do paciente
// e complementamos com mock representativo.

export function buildDados(p) {
  const idade = p.idade ? `${p.idade} anos` : "—";

  const pessoais = [
    { label: "Nome completo", value: p.name },
    { label: "Data de nascimento", value: p.nascimento || "—" },
    { label: "Idade", value: idade },
    { label: "Sexo", value: p.sexo || "—" },
    { label: "Estado civil", value: p.estadoCivil || "—" },
    { label: "Profissão", value: p.profissao || "—" },
    { label: "CPF", value: p.cpf || "—" },
    { label: "Telefone / WhatsApp", value: p.telefone || "—" },
    { label: "E-mail", value: p.email || "—" },
    { label: "Endereço", value: p.endereco || "—" },
    { label: "CEP", value: p.cep || "—" },
    { label: "Bairro", value: p.bairro || "—" },
    { label: "Cidade", value: p.cidade || "—" },
    { label: "Nome da mãe", value: p.nomeMae || "—" },
    { label: "Objetivo", value: p.objetivo || "—" }
  ];

  const anamnese = [
    {
      title: "Condições socioeconômicas",
      fields: [
        { label: "Renda familiar", value: "3 a 5 salários mínimos" },
        { label: "Pessoas na residência", value: "3" },
        { label: "Quem prepara as refeições", value: "A própria paciente" },
        { label: "Onde realiza as refeições", value: "Casa e trabalho" },
        { label: "Saneamento básico", value: "Sim" },
        { label: "Água de consumo", value: "Filtrada" }
      ]
    },
    {
      title: "Estilo de vida",
      fields: [
        { label: "Horas de sono", value: "7h por noite" },
        { label: "Qualidade do sono", value: "Boa" },
        { label: "Atividade física", value: "Musculação" },
        { label: "Frequência", value: "4x por semana" },
        { label: "Tabagismo", value: "Não" },
        { label: "Etilismo", value: "Socialmente" },
        { label: "Nível de estresse", value: "Moderado" },
        { label: "Ingestão de água", value: "2 L por dia" }
      ]
    },
    {
      title: "História patológica",
      fields: [
        { label: "Doenças na família", value: "Hipertensão (pai), Diabetes (avó)" },
        { label: "Doenças prévias/atuais", value: "Nenhuma relevante" },
        { label: "Medicamentos em uso", value: "Polivitamínico" },
        { label: "Alergias / intolerâncias", value: "Intolerância à lactose" },
        { label: "Cirurgias", value: "Nega" },
        { label: "Uso de suplementos", value: "Whey protein, creatina" }
      ]
    },
    {
      title: "Hábitos alimentares",
      fields: [
        { label: "Apetite", value: "Normal" },
        { label: "Mastigação", value: "Adequada" },
        { label: "Refeições por dia", value: "6" },
        { label: "Belisca entre refeições", value: "Às vezes" },
        { label: "Preferências", value: "Frutas, frango, arroz" },
        { label: "Aversões", value: "Fígado, jiló" },
        { label: "Consumo de doces", value: "Baixo" },
        { label: "Funcionamento intestinal", value: "Regular (1x ao dia)" }
      ]
    },
    {
      title: "Avaliação antropométrica",
      fields: [
        { label: "Peso atual", value: "64,0 kg" },
        { label: "Altura", value: "1,65 m" },
        { label: "IMC", value: "23,5 kg/m² (eutrófico)" },
        { label: "Circunferência da cintura", value: "74 cm" },
        { label: "Circunferência do quadril", value: "98 cm" },
        { label: "RCQ", value: "0,76" },
        { label: "% de gordura", value: "26,4%" },
        { label: "Massa magra", value: "47,1 kg" }
      ]
    },
    {
      title: "Diagnóstico e objetivos",
      fields: [
        { label: "Diagnóstico nutricional", value: "Eutrofia com objetivo de recomposição corporal" },
        { label: "Objetivo", value: p.objetivo || "Saúde e energia" },
        { label: "Conduta", value: "Plano normocalórico, sem lactose, hiperproteico" },
        { label: "Meta de água", value: "2,5 L por dia" }
      ]
    }
  ];

  return { pessoais, anamnese };
}
