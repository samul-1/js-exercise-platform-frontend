export function forceFileDownload (response, title) {
  console.log(title)
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', title)
  document.body.appendChild(link)
  link.click()
}

export async function beforeDownload ({ html2pdf, options, pdfContent }) {
  await html2pdf()
    .set(options)
    .from(pdfContent)
    .toPdf()
    .get('pdf')
    .then(pdf => {
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.setTextColor(150)
        pdf.text(
          'Page ' + i + ' of ' + totalPages,
          pdf.internal.pageSize.getWidth() * 0.88,
          pdf.internal.pageSize.getHeight() - 0.3
        )
      }
    })
    .save()
}
