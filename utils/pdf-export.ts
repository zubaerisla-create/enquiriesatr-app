import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

interface ReportData {
  llm_overall_risk: string;
  llm_key_findings: string[];
  llm_overall_summary: string;
  llm_recommended_actions: string[];
  created_at?: string;
}

export const exportReportToPDF = async (reportData: ReportData) => {
  try {
    const {
      llm_overall_risk,
      llm_key_findings,
      llm_overall_summary,
      llm_recommended_actions,
    } = reportData;

    const date = new Date().toLocaleDateString();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Threat Assessment Report</title>
          <style>
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 0;
              margin: 0;
              color: #1f2937;
              line-height: 1.6;
              background-color: white;
            }
            .header-content {
              height: 70px;
              border-bottom: 2px solid #131C2E;
              padding: 20px 0;
              background-color: white;
              display: flex;
              flex-direction: column;
              justify-content: center;
              width: 100%;
            }
            .page-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 0 40px;
            }
            .title {
              font-size: 24px;
              font-weight: 900;
              text-transform: uppercase;
              color: #131C2E;
              margin: 0;
            }
            .date {
              font-size: 12px;
              color: #6b7280;
              margin-top: 4px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #131C2E;
              margin-top: 25px;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .risk-card {
              background-color: #131C2E;
              border-radius: 12px;
              padding: 24px;
              color: white;
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .risk-label {
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              color: #9ca3af;
              margin-bottom: 8px;
            }
            .risk-value {
              font-size: 32px;
              font-weight: 900;
              letter-spacing: 2px;
            }
            .finding-item {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 18px;
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .action-item {
              display: flex;
              margin-bottom: 15px;
              padding-left: 5px;
              page-break-inside: avoid;
            }
            .action-number {
              background-color: #131C2E;
              color: white;
              width: 26px;
              height: 26px;
              border-radius: 6px;
              text-align: center;
              line-height: 26px;
              font-weight: bold;
              font-size: 13px;
              margin-right: 15px;
              flex-shrink: 0;
            }
            .summary-box {
              background-color: #f3f4f6;
              border-radius: 12px;
              padding: 24px;
              font-style: italic;
              border-left: 5px solid #131C2E;
              line-height: 1.8;
              page-break-inside: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            @media print {
              .page-container { padding: 0 20px; }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <table>
              <thead>
                <tr>
                  <td>
                    <div class="header-content">
                      <h1 class="title">Threat Assessment Report</h1>
                      <p class="date">Generated on: ${date}</p>
                    </div>
                    <div style="height: 20px;"></div> <!-- Spacer after header on each page -->
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="risk-card">
                      <div class="risk-label">Overall Risk Level</div>
                      <div class="risk-value">${llm_overall_risk.toUpperCase()}</div>
                    </div>

                    <div class="section-title">Key Findings</div>
                    ${llm_key_findings.map(finding => `
                      <div class="finding-item">${finding}</div>
                    `).join('')}

                    <div class="section-title">Recommended Actions</div>
                    ${llm_recommended_actions.map((action, i) => `
                      <div class="action-item">
                        <div class="action-number">${i + 1}</div>
                        <div style="flex: 1;">${action}</div>
                      </div>
                    `).join('')}

                    <div class="section-title">Executive Summary</div>
                    <div class="summary-box">
                      ${llm_overall_summary}
                    </div>

                    <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center;">
                      &copy; ${new Date().getFullYear()} Guardian Security Assessment.
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    // On iOS/Android we can generate and share
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (Platform.OS === 'ios') {
      await Sharing.shareAsync(uri);
    } else {
      // For Android, we can share or use the file URI
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export Risk Report' });
    }

  } catch (error) {
    console.error('Error exporting PDF:', error);
    Alert.alert('Export Failed', 'An error occurred while generating the PDF report.');
  }
};
