import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tables } from '@/types/database';

type Validation = Tables<'validations'>;
type Idea = Tables<'ideas'>;

export async function exportReportToPDF(idea: Idea, validation: Validation): Promise<void> {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Helper for colors
        const colors = {
            primary: [59, 130, 246], // #3b82f6
            text: [31, 41, 55],    // #1f2937
            muted: [107, 114, 128], // #6b7280
            success: [34, 197, 94], // #22c55e
            warning: [245, 158, 11], // #f59e0b
            danger: [239, 68, 68],  // #ef4444
        };

        const getScoreColor = (score: number) => {
            if (score < 50) return colors.danger;
            if (score < 80) return colors.warning;
            return colors.success;
        };

        // 1. Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text(idea.title, 20, 25);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text('Startup Idea Validation Report', 20, 33);

        const dateStr = validation.created_at
            ? new Date(validation.created_at).toLocaleDateString('en-US', { dateStyle: 'long' })
            : 'N/A';
        doc.setFontSize(10);
        doc.text(`Generated on ${dateStr}`, 20, 39);

        // 2. Overall Score Section
        doc.setDrawColor(229, 231, 235); // #e5e7eb
        doc.line(20, 45, 190, 45);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.text('OVERALL SCORE', 20, 55);

        doc.setFontSize(48);
        const scoreColor = getScoreColor(validation.overall_score);
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.text(`${validation.overall_score}`, 20, 75);

        doc.setFontSize(18);
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text('/ 100', 50, 75);

        // Traffic Light Indicator
        const lightColors: Record<string, number[]> = {
            green: colors.success,
            yellow: colors.warning,
            red: colors.danger,
        };
        const lightLabel: Record<string, string> = {
            green: 'GO - High Potential',
            yellow: 'CAUTION - Needs Refinement',
            red: 'STOP - Major Pivot Needed',
        };

        const lightColor = (lightColors[validation.traffic_light] || colors.muted) as [number, number, number];
        doc.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
        doc.roundedRect(80, 60, 100, 15, 2, 2, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(lightLabel[validation.traffic_light] || 'Status Unknown', 130, 70, { align: 'center' });

        // 3. Dimensions Table
        const dimensionRows = [
            ['Painkiller', `${validation.painkiller_score}/100`, validation.painkiller_reasoning],
            ['Revenue Model', `${validation.revenue_model_score}/100`, validation.revenue_model_reasoning],
            ['Acquisition', `${validation.acquisition_score}/100`, validation.acquisition_reasoning],
            ['Moat', `${validation.moat_score}/100`, validation.moat_reasoning],
            ['Founder Fit', `${validation.founder_fit_score}/100`, validation.founder_fit_reasoning],
            ['Time to Revenue', `${validation.time_to_revenue_score}/100`, validation.time_to_revenue_reasoning],
            ['Scalability', `${validation.scalability_score}/100`, validation.scalability_reasoning],
        ];

        autoTable(doc, {
            startY: 85,
            head: [['Dimension', 'Score', 'Reasoning']],
            body: dimensionRows,
            headStyles: { fillColor: colors.primary, textColor: 255, fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 35, fontStyle: 'bold' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 'auto' },
            },
            theme: 'striped',
            margin: { left: 20, right: 20 },
        });

        // 4. Insights Section
        let currentY = (doc as any).lastAutoTable.finalY + 15;

        // Check if we need a new page
        if (currentY > 240) {
            doc.addPage();
            currentY = 25;
        }

        // Red Flags
        const redFlags = (validation.red_flags as string[]) || [];
        if (redFlags.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
            doc.text('Critical Red Flags', 20, currentY);
            currentY += 7;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            redFlags.forEach((flag) => {
                const lines = doc.splitTextToSize(`• ${flag}`, 170);
                doc.text(lines, 25, currentY);
                currentY += (lines.length * 5) + 2;
            });
            currentY += 5;
        }

        // Comparable Companies
        const comps = (validation.comparable_companies as any[]) || [];
        if (comps.length > 0) {
            if (currentY > 240) { doc.addPage(); currentY = 25; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            doc.text('Comparable Companies', 20, currentY);
            currentY += 7;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            comps.forEach((comp) => {
                const text = `${comp.name} (${comp.outcome}): ${comp.similarity}`;
                const lines = doc.splitTextToSize(`• ${text}`, 170);
                doc.text(lines, 25, currentY);
                currentY += (lines.length * 5) + 2;
            });
            currentY += 5;
        }

        // Recommendations
        const recs = (validation.recommendations as string[]) || [];
        if (recs.length > 0) {
            if (currentY > 240) { doc.addPage(); currentY = 25; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
            doc.text('Strategic Recommendations', 20, currentY);
            currentY += 7;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            recs.forEach((rec) => {
                const lines = doc.splitTextToSize(`• ${rec}`, 170);
                doc.text(lines, 25, currentY);
                currentY += (lines.length * 5) + 2;
            });
        }

        // 5. Footer (Page numbers and branding)
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
            doc.text('Generated by Venlidate - The AI Startup Co-founder', 105, 285, { align: 'center' });
            doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
        }

        doc.save(`${idea.title.replace(/\s+/g, '-').toLowerCase()}-validation-report.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
