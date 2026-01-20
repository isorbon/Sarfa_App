// Export tooltip translations for all languages
// Format: languageCode: { exportCSV: 'translation', exportPDF: 'translation'}

const exportTranslations = {
    'en-US': { exportCSV: 'Export to CSV', exportPDF: 'Export to PDF' },
    'en-GB': { exportCSV: 'Export to CSV', exportPDF: 'Export to PDF' },
    'de': { exportCSV: 'Als CSV exportieren', exportPDF: 'Als PDF exportieren' },
    'es': { exportCSV: 'Exportar a CSV', exportPDF: 'Exportar a PDF' },
    'fr': { exportCSV: 'Exporter en CSV', exportPDF: 'Exporter en PDF' },
    'ru': { exportCSV: 'Экспорт в CSV', exportPDF: 'Экспорт в PDF' },
    'it': { exportCSV: 'Esporta in CSV', exportPDF: 'Esporta in PDF' },
    'pt-BR': { exportCSV: 'Exportar para CSV', exportPDF: 'Exportar para PDF' },
    'ja': { exportCSV: 'CSVにエクスポート', exportPDF: 'PDFにエクスポート' },
    'zh-CN': { exportCSV: '导出为CSV', exportPDF: '导出为PDF' },
    'zh-TW': { exportCSV: '匯出為CSV', exportPDF: '匯出為PDF' },
    'nl': { exportCSV: 'Exporteren naar CSV', exportPDF: 'Exporteren naar PDF' },
    'pl': { exportCSV: 'Eksportuj do CSVExpor', exportPDF: 'Eksportuj do PDF' },
    'tr': { exportCSV: 'CSV olarak dışa aktar', exportPDF: 'PDF olarak dışa aktar' },
    'uk': { exportCSV: 'Експортувати в CSV', exportPDF: 'Експортувати в PDF' },
    'cs': { exportCSV: 'Exportovat do CSV', exportPDF: 'Exportovat do PDF' },
    'ro': { exportCSV: 'Exportă în CSV', exportPDF: 'Exportă în PDF' },
    'hu': { exportCSV: 'Exportálás CSV-be', exportPDF: 'Exportálás PDF-be' },
    'th': { exportCSV: 'ส่งออกเป็น CSV', exportPDF: 'ส่งออกเป็น PDF' },
    'id': { exportCSV: 'Ekspor ke CSV', exportPDF: 'Ekspor ke PDF' },
    'az': { exportCSV: 'CSV-yə ixrac edin', exportPDF: 'PDF-ə ixrac edin' },
    'hy': { exportCSV: 'Արտահանել CSV', exportPDF: 'Արտահանել PDF' },
    'kg': { exportCSV: 'CSV форматына экспорттоо', exportPDF: 'PDF форматына экспорттоо' },
    'kz': { exportCSV: 'CSV форматына экспорттау', exportPDF: 'PDF форматына экспорттау' },
    'tj': { exportCSV: 'Содирот ба CSV', exportPDF: 'Содирот ба PDF' },
    'uz': { exportCSV: 'CSV ga eksport qilish', exportPDF: 'PDF ga eksport qilish' },
};

// For each language, add these two lines to the filters section:
//         exportCSV: '<translation>',
//         exportPDF: '<translation>',
