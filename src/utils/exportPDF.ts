import { jsPDF } from 'jspdf';

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
}

export function exportToPDF(content: {
  sections: Array<{
    title: string;
    content: string | string[];
  }>;
}, options: ExportOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, margin, yPosition);
  yPosition += 12;

  // Subtitle
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(options.subtitle, margin, yPosition);
    yPosition += 8;
    doc.setTextColor(0);
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
  yPosition += 15;

  // Divider
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Sections
  content.sections.forEach(section => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    }

    // Section title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(section.title, margin, yPosition);
    yPosition += 8;

    // Section content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    if (typeof section.content === 'string') {
      const lines = doc.splitTextToSize(section.content, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
    } else if (Array.isArray(section.content)) {
      section.content.forEach(item => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 6;
      });
    }

    yPosition += 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = options.filename || `${options.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}

// Export project report
export function exportProjectReport(project: {
  name: string;
  description?: string;
  status: string;
  progress: number;
  tasks?: Array<{ title: string; status: string; assignee?: string }>;
  agents?: Array<{ name: string; status: string; cost: number }>;
}) {
  const sections = [
    {
      title: 'Visão Geral',
      content: [
        `Nome: ${project.name}`,
        project.description ? `Descrição: ${project.description}` : '',
        `Status: ${project.status}`,
        `Progresso: ${project.progress}%`
      ].filter(Boolean) as string[]
    }
  ];

  if (project.tasks && project.tasks.length > 0) {
    sections.push({
      title: 'Tarefas',
      content: project.tasks.map(t => 
        `${t.title} - ${t.status}${t.assignee ? ` (${t.assignee})` : ''}`
      )
    });
  }

  if (project.agents && project.agents.length > 0) {
    sections.push({
      title: 'Agentes',
      content: project.agents.map(a => 
        `${a.name} - ${a.status} - Custo: €${a.cost.toFixed(2)}`
      )
    });
  }

  exportToPDF({ sections }, {
    title: `Relatório do Projeto: ${project.name}`,
    subtitle: project.description,
    filename: `projeto_${project.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`
  });
}

// Export agent execution report
export function exportAgentReport(execution: {
  agentName: string;
  task: string;
  status: string;
  duration: number;
  cost: number;
  tokens: number;
  output?: string;
}) {
  const sections = [
    {
      title: 'Informações da Execução',
      content: [
        `Agente: ${execution.agentName}`,
        `Tarefa: ${execution.task}`,
        `Status: ${execution.status}`,
        `Duração: ${(execution.duration / 1000).toFixed(2)}s`,
        `Custo: €${execution.cost.toFixed(4)}`,
        `Tokens: ${execution.tokens.toLocaleString()}`
      ]
    }
  ];

  if (execution.output) {
    sections.push({
      title: 'Output',
      content: [execution.output]
    });
  }

  exportToPDF({ sections }, {
    title: `Relatório de Execução: ${execution.agentName}`,
    filename: `agente_${execution.agentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
  });
}
